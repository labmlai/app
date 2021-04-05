import sys
import typing

import flask
import requests
import werkzeug.wrappers
from flask import request, make_response, jsonify

from .logger import logger
from . import settings
from . import block_uuids
from . import auth
from .db import run
from .db import computer
from .db import session
from .db import app_token
from .db import user
from .db import project
from . import utils
from . import analyses

request = typing.cast(werkzeug.wrappers.Request, request)


def is_new_run_added():
    is_run_added = False
    u = auth.get_auth_user()
    if u:
        is_run_added = u.default_project.is_run_added

    return is_run_added


def get_user_profile(token: str):
    res = requests.get(f'{settings.AUTH0_DOMAIN}/userinfo', headers={'Authorization': f'Bearer {token}'})

    return res.json()


@utils.mix_panel.MixPanelEvent.time_this(None)
def sign_in() -> flask.Response:
    ret = request.json
    if 'token' in ret:
        user_profile = get_user_profile(ret['token'])

        u = user.get_or_create_user(user.AuthOInfo(
            **{k: user_profile.get(k, '') for k in ('name', 'email', 'sub', 'email_verified', 'picture')}))
    else:
        u = user.get_or_create_user(user.AuthOInfo(**request.json))

    utils.mix_panel.MixPanelEvent.people_set(identifier=u.email, first_name=u.name, last_name='', email=u.email)

    token_id = ''  # generate different token for every login
    at = app_token.get_or_create(token_id)

    at.user = u.key
    at.save()

    response = make_response(utils.format_rv({'is_successful': True, 'app_token': at.token_id}))

    return response


@utils.mix_panel.MixPanelEvent.time_this(None)
def sign_out() -> flask.Response:
    token_id = request.headers.get('Authorization', '')
    at = app_token.get_or_create(token_id)

    app_token.delete(at)

    response = make_response(utils.format_rv({'is_successful': True}))

    return response


@utils.mix_panel.MixPanelEvent.time_this(0.4)
def update_session() -> flask.Response:
    errors = []

    token = request.args.get('labml_token', '')
    session_uuid = request.args.get('session_uuid', '')
    computer_uuid = request.args.get('computer_uuid', '')
    version = request.args.get('labml_version', '')

    if len(computer_uuid) < 10:
        error = {'error': 'invalid_computer_uuid',
                 'message': f'Invalid Computer UUID'}
        errors.append(error)
        return jsonify({'errors': errors})

    if len(session_uuid) < 10:
        error = {'error': 'invalid_session_uuid',
                 'message': f'Invalid Session UUID'}
        errors.append(error)
        return jsonify({'errors': errors})

    if utils.check_version(version, settings.LABML_VERSION):
        error = {'error': 'labml_outdated',
                 'message': f'Your labml client is outdated, please upgrade: '
                            'pip install labml --upgrade'}
        errors.append(error)
        return jsonify({'errors': errors})

    p = project.get_project(labml_token=token)
    if not p:
        token = settings.FLOAT_PROJECT_TOKEN

    c = session.get(session_uuid, token)
    if not c and not p:
        if request.args.get('labml_token', ''):
            error = {'error': 'invalid_token',
                     'message': 'Please create a valid token at https://app.labml.ai.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        else:
            error = {'warning': 'empty_token',
                     'message': 'Please create a valid token at https://app.labml.ai.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        errors.append(error)

    c = session.get_or_create(session_uuid, computer_uuid, token, request.remote_addr)
    s = c.status.load()

    if isinstance(request.json, list):
        data = request.json
    else:
        data = [request.json]

    for d in data:
        c.update_session(d)
        s.update_time_status(d)
        if 'track' in d:
            analyses.AnalysisManager.track_computer(session_uuid, d['track'])

    logger.debug(
        f'update_session, session_uuid: {session_uuid}, size : {sys.getsizeof(str(request.json)) / 1024} Kb')

    return jsonify({'errors': errors, 'url': c.url})


def claim_session(session_uuid: str) -> None:
    c = session.get_session(session_uuid)
    at = auth.get_app_token()

    if not at.user:
        return utils.format_rv({'is_successful': False})

    u = at.user.load()
    default_project = u.default_project

    if c.session_uuid not in default_project.sessions:
        float_project = project.get_project(labml_token=settings.FLOAT_PROJECT_TOKEN)

        if c.session_uuid in float_project.sessions:
            default_project.sessions[c.session_uuid] = c.key
            default_project.save()
            c.is_claimed = True
            c.save()

            utils.mix_panel.MixPanelEvent.track('session_claimed', {'session_uuid': c.session_uuid})
            utils.mix_panel.MixPanelEvent.computer_claimed_set(u.email)

    return utils.format_rv({'is_successful': True})


@utils.mix_panel.MixPanelEvent.time_this(None)
def get_session(session_uuid: str) -> flask.Response:
    session_data = {}
    status_code = 404

    c = session.get_session(session_uuid)
    if c:
        session_data = c.get_data()
        status_code = 200

    response = make_response(utils.format_rv(session_data))
    response.status_code = status_code

    return response


def edit_session(session_uuid: str) -> flask.Response:
    c = session.get_session(session_uuid)
    errors = []

    if c:
        data = request.json
        c.edit_session(data)
    else:
        errors.append({'edit_session': 'invalid session_uuid'})

    return utils.format_rv({'errors': errors})


@auth.login_required
@auth.check_labml_token_permission
@utils.mix_panel.MixPanelEvent.time_this(None)
def get_sessions(labml_token: str) -> flask.Response:
    u = auth.get_auth_user()

    if labml_token:
        sessions_list = session.get_sessions(labml_token)
    else:
        default_project = u.default_project
        labml_token = default_project.labml_token
        sessions_list = default_project.get_sessions()

    res = []
    for c in sessions_list:
        s = session.get_status(c.session_uuid)
        if c.session_uuid:
            res.append({**c.get_summary(), **s.get_data()})

    res = sorted(res, key=lambda i: i['start_time'], reverse=True)

    # TODO CHANGE HERE
    return utils.format_rv({'computers': res, 'labml_token': labml_token})


@utils.mix_panel.MixPanelEvent.time_this(0.4)
def update_run() -> flask.Response:
    errors = []

    token = request.args.get('labml_token', '')
    version = request.args.get('labml_version', '')
    run_uuid = request.args.get('run_uuid', '')

    if run_uuid in block_uuids.run_uuids:
        error = {'error': 'block_run_uuid',
                 'message': f'Block Run UUID'}
        errors.append(error)
        return jsonify({'errors': errors})

    if len(run_uuid) < 10:
        error = {'error': 'invalid_run_uuid',
                 'message': f'Invalid Run UUID'}
        errors.append(error)
        return jsonify({'errors': errors})

    if utils.check_version(version, settings.LABML_VERSION):
        error = {'error': 'labml_outdated',
                 'message': f'Your labml client is outdated, please upgrade: '
                            'pip install labml --upgrade'}
        errors.append(error)
        return jsonify({'errors': errors})

    p = project.get_project(labml_token=token)
    if not p:
        token = settings.FLOAT_PROJECT_TOKEN

    r = run.get(run_uuid, token)
    if not r and not p:
        if request.args.get('labml_token', ''):
            error = {'error': 'invalid_token',
                     'message': 'Please create a valid token at https://app.labml.ai.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        else:
            error = {'warning': 'empty_token',
                     'message': 'Please create a valid token at https://app.labml.ai.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        errors.append(error)

    r = run.get_or_create(run_uuid, token, request.remote_addr)
    s = r.status.load()

    if isinstance(request.json, list):
        data = request.json
    else:
        data = [request.json]

    for d in data:
        r.update_run(d)
        s.update_time_status(d)
        if 'track' in d:
            analyses.AnalysisManager.track(run_uuid, d['track'])

    logger.debug(f'update_run, run_uuid: {run_uuid}, size : {sys.getsizeof(str(request.json)) / 1024} Kb')

    hp_values = analyses.AnalysisManager.get_analysis('HyperParamsAnalysis', run_uuid).get_hyper_params()

    return jsonify({'errors': errors, 'url': r.url, 'dynamic': hp_values})


def claim_run(run_uuid: str) -> flask.Response:
    r = run.get_run(run_uuid)
    at = auth.get_app_token()

    if not at.user:
        return utils.format_rv({'is_successful': False})

    u = at.user.load()
    default_project = u.default_project

    if r.run_uuid not in default_project.runs:
        float_project = project.get_project(labml_token=settings.FLOAT_PROJECT_TOKEN)

        if r.run_uuid in float_project.runs:
            default_project.runs[r.run_uuid] = r.key
            default_project.is_run_added = True
            default_project.save()
            r.is_claimed = True
            r.owner = u.email
            r.save()

            utils.mix_panel.MixPanelEvent.track('run_claimed', {'run_uuid': r.run_uuid})
            utils.mix_panel.MixPanelEvent.run_claimed_set(u.email)

    return utils.format_rv({'is_successful': True})


@utils.mix_panel.MixPanelEvent.time_this(None)
def get_run(run_uuid: str) -> flask.Response:
    run_data = {}
    status_code = 404

    r = run.get_run(run_uuid)
    if r:
        run_data = r.get_data()
        status_code = 200

    print(run_data)

    response = make_response(utils.format_rv(run_data, {'is_run_added': is_new_run_added()}))
    response.status_code = status_code

    return response


@auth.login_required
def edit_run(run_uuid: str) -> flask.Response:
    r = run.get_run(run_uuid)
    errors = []

    if r:
        data = request.json
        r.edit_run(data)
    else:
        errors.append({'edit_run': 'invalid run uuid'})

    return utils.format_rv({'errors': errors})


@utils.mix_panel.MixPanelEvent.time_this(None)
def get_run_status(run_uuid: str) -> flask.Response:
    status_data = {}
    status_code = 404

    s = run.get_status(run_uuid)
    if s:
        status_data = s.get_data()
        status_code = 200

    response = make_response(utils.format_rv(status_data))
    response.status_code = status_code

    return response


@utils.mix_panel.MixPanelEvent.time_this(None)
def get_session_status(session_uuid: str) -> flask.Response:
    status_data = {}
    status_code = 404

    s = session.get_status(session_uuid)
    if s:
        status_data = s.get_data()
        status_code = 200

    response = make_response(utils.format_rv(status_data))
    response.status_code = status_code

    return response


@auth.login_required
@utils.mix_panel.MixPanelEvent.time_this(None)
@auth.check_labml_token_permission
def get_runs(labml_token: str) -> flask.Response:
    u = auth.get_auth_user()

    if labml_token:
        runs_list = run.get_runs(labml_token)
    else:
        default_project = u.default_project
        labml_token = default_project.labml_token
        runs_list = default_project.get_runs()

    res = []
    for r in runs_list:
        s = run.get_status(r.run_uuid)
        if r.run_uuid:
            res.append({**r.get_summary(), **s.get_data()})

    res = sorted(res, key=lambda i: i['start_time'], reverse=True)

    return utils.format_rv({'runs': res, 'labml_token': labml_token})


@utils.mix_panel.MixPanelEvent.time_this(None)
@auth.login_required
def delete_runs() -> flask.Response:
    run_uuids = request.json['run_uuids']

    u = auth.get_auth_user()
    u.default_project.delete_runs(run_uuids, u.email)

    return utils.format_rv({'is_successful': True})


@auth.login_required
@utils.mix_panel.MixPanelEvent.time_this(None)
def set_user() -> flask.Response:
    data = request.json['user']
    u = auth.get_auth_user()
    if u:
        u.set_user(data)

    return utils.format_rv({'is_successful': True})


@utils.mix_panel.MixPanelEvent.time_this(None)
@auth.login_required
def delete_sessions() -> flask.Response:
    session_uuids = request.json['session_uuids']

    u = auth.get_auth_user()
    u.default_project.delete_sessions(session_uuids)

    return utils.format_rv({'is_successful': True})


@auth.login_required
@utils.mix_panel.MixPanelEvent.time_this(None)
def get_user() -> flask.Response:
    u = auth.get_auth_user()

    return utils.format_rv(u.get_data())


@auth.login_required
def add_run(run_uuid: str) -> flask.Response:
    u = auth.get_auth_user()

    u.default_project.add_run(run_uuid)

    return utils.format_rv({'is_successful': True})


@auth.login_required
def add_session(session_uuid: str) -> flask.Response:
    u = auth.get_auth_user()

    u.default_project.add_session(session_uuid)

    return utils.format_rv({'is_successful': True})


@utils.mix_panel.MixPanelEvent.time_this(None)
def is_user_logged() -> flask.Response:
    return utils.format_rv({'is_user_logged': auth.get_is_user_logged()})


@utils.mix_panel.MixPanelEvent.time_this(None)
def get_computer(computer_uuid) -> flask.Response:
    c = computer.get_or_create(computer_uuid)

    return utils.format_rv(c.get_data())


def _add_server(app: flask.Flask, method: str, func: typing.Callable, url: str):
    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def _add_ui(app: flask.Flask, method: str, func: typing.Callable, url: str):
    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add_server(app, 'POST', update_run, 'track')
    _add_server(app, 'POST', update_session, 'computer')

    _add_ui(app, 'GET', get_runs, 'runs/<labml_token>')
    _add_ui(app, 'GET', get_sessions, 'computers/<labml_token>')
    _add_ui(app, 'PUT', delete_runs, 'runs')
    _add_ui(app, 'PUT', delete_sessions, 'computers')
    # _add_ui(app, 'GET', get_computer, 'computer/<computer_uuid>')
    _add_ui(app, 'GET', get_user, 'user')
    _add_ui(app, 'POST', set_user, 'user')

    _add_ui(app, 'GET', get_run, 'run/<run_uuid>')
    _add_ui(app, 'POST', edit_run, 'run/<run_uuid>')
    _add_ui(app, 'PUT', add_run, 'run/<run_uuid>/add')
    _add_ui(app, 'PUT', claim_run, 'run/<run_uuid>/claim')
    _add_ui(app, 'GET', get_session, 'computer/<session_uuid>')
    _add_ui(app, 'POST', edit_session, 'computer/<session_uuid>')
    _add_ui(app, 'PUT', add_session, 'computer/<session_uuid>/add')
    _add_ui(app, 'PUT', claim_session, 'computer/<session_uuid>/claim')
    _add_ui(app, 'GET', get_run_status, 'run/status/<run_uuid>')
    _add_ui(app, 'GET', get_session_status, 'computer/status/<session_uuid>')

    _add_ui(app, 'POST', sign_in, 'auth/sign_in')
    _add_ui(app, 'DELETE', sign_out, 'auth/sign_out')
    _add_ui(app, 'GET', is_user_logged, 'auth/is_logged')

    for method, func, url, login_required in analyses.AnalysisManager.get_handlers():
        if login_required:
            func = auth.login_required(func)
        _add_ui(app, method, func, url)
