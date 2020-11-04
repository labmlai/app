import sys
import typing
from typing import Any

import flask
import werkzeug.wrappers
from flask import jsonify, request, make_response

from labml_db import Key
from . import settings
from .auth import login_required, check_labml_token_permission, get_session
from .db import run
from .db import session
from .db import status
from .db import user
from .enums import Enums
from .logging import logger
from .utils import check_version

request = typing.cast(werkzeug.wrappers.Request, request)


def sign_in() -> flask.Response:
    u = user.get_or_create_user(user.AuthOInfo(**request.json))

    session_id = request.cookies.get('session_id')
    s = session.get_or_create(session_id)

    s.user = u.key
    s.save()

    response = make_response(jsonify({'is_successful': True}))

    if session_id != s.session_id:
        response.set_cookie('session_id', s.session_id)

    logger.debug(f'sign_in, user: {u.key}')

    return response


def sign_out() -> flask.Response:
    session_id = request.cookies.get('session_id')
    s = session.get_or_create(session_id)

    session.delete(s)

    response = make_response(jsonify({'is_successful': True}))

    if session_id != s.session_id:
        response.set_cookie('session_id', s.session_id)

    logger.debug(f'sign_out, session_id: {s.session_id}')

    return response


def update_run() -> flask.Response:
    errors = []

    token = request.args.get('labml_token', '')
    version = request.args.get('labml_version', '')
    run_uuid = request.args.get('run_uuid', '')

    if len(run_uuid) < 10:
        error = {'error': 'invalid_run_uuid',
                 'message': f'Invalid Run UUID'}
        errors.append(error)
        return jsonify({'errors': errors})

    if check_version(version, settings.LABML_VERSION):
        error = {'error': 'labml_outdated',
                 'message': f'Your labml client is outdated, please upgrade: '
                            'pip install labml --upgrade'}
        errors.append(error)
        return jsonify({'errors': errors})

    p = user.get_project(labml_token=token)
    if not p:
        token = settings.FLOAT_PROJECT_TOKEN

    r = run.get(run_uuid, token)
    if not r and not p:
        if token:
            error = {'error': 'invalid_token',
                     'message': 'Please create a valid token at https://web.lab-ml.com.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        else:
            error = {'warning': 'empty_token',
                     'message': 'Please create a valid token at https://web.lab-ml.com.\n'
                                'Click on the experiment link to monitor the experiment and '
                                'add it to your experiments list.'}
        errors.append(error)

    r = run.get_or_create(run_uuid, token, request.remote_addr)
    s = r.status.load()

    r.update_run(request.json)
    s.update_time_status(request.json)
    if 'track' in request.json:
        r.track(request.json['track'])

    logger.debug(f'update_run, run_uuid: {run_uuid}, size : {sys.getsizeof(str(request.json)) / 1024} Kb')

    return jsonify({'errors': errors, 'url': r.url})


def set_run(run_uuid: str) -> flask.Response:
    r = run.get_run(run_uuid)
    r.update_preferences(request.json)

    logger.debug(f'update_preferences, run_uuid: {run_uuid}')

    return jsonify({'errors': r.errors})


def claim_run(run_uuid: str, run_key: Key[run.Run]) -> None:
    s = get_session()

    default_project = s.user.load().default_project
    if run_uuid not in default_project.runs:
        float_project = user.get_project(labml_token=settings.FLOAT_PROJECT_TOKEN)
        if run_uuid in float_project.runs:
            default_project.runs[run_uuid] = run_key
            default_project.save()


@login_required
def get_run(run_uuid: str) -> flask.Response:
    run_data = {}
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        run_data = r.get_data()
        status_code = 200

        claim_run(run_uuid, r.key)

    response = make_response(jsonify(run_data))
    response.status_code = status_code

    logger.debug(f'run, run_uuid: {run_uuid}')

    return response


@login_required
def get_status(run_uuid: str) -> flask.Response:
    status_data = {}
    status_code = 400

    s = status.get_status(run_uuid)
    if s:
        status_data = s.get_data()
        status_code = 200

    response = make_response(jsonify(status_data))
    response.status_code = status_code

    logger.debug(f'status, run_uuid: {run_uuid}')

    return response


@login_required
@check_labml_token_permission
def get_runs(labml_token: str) -> flask.Response:
    s = get_session()

    if labml_token:
        runs_list = run.get_runs(labml_token)
    else:
        default_project = s.user.load().default_project
        labml_token = default_project.labml_token
        runs_list = default_project.get_runs()

    res = []
    for r in runs_list:
        s = status.get_status(r.run_uuid)
        if r.run_uuid:
            res.append({**r.get_summary(), **s.get_data()})

    res = sorted(res, key=lambda i: i['start_time'], reverse=True)

    logger.debug(f'runs, labml_token : {labml_token}')

    return jsonify({'runs': res, 'labml_token': labml_token})


@login_required
def get_user() -> Any:
    s = get_session()

    u = s.user.load()
    logger.debug(f'get_user, user : {u.key}')

    return jsonify(u.get_data())


@login_required
def get_metrics_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.METRIC)
        status_code = 200

    logger.debug(f'metrics_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@login_required
def get_params_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.PARAM)
        status_code = 200

    logger.debug(f'params_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@login_required
def get_modules_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.MODULE)
        status_code = 200

    logger.debug(f'modules_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@login_required
def get_times_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.TIME)
        status_code = 200

    logger.debug(f'times_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@login_required
def get_grads_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.GRAD)
        status_code = 200

    logger.debug(f'grads_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


def _add(app: flask.Flask, method: str, func: typing.Callable, url: str):
    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add(app, 'POST', update_run, 'track')

    _add(app, 'GET', get_runs, 'runs/<labml_token>')
    _add(app, 'GET', get_user, 'user')

    _add(app, 'GET', get_run, 'run/<run_uuid>')
    _add(app, 'GET', get_status, 'status/<run_uuid>')

    _add(app, 'POST', get_metrics_tracking, 'metrics_track/<run_uuid>')
    _add(app, 'POST', get_grads_tracking, 'grads_track/<run_uuid>')
    _add(app, 'POST', get_params_tracking, 'params_track/<run_uuid>')
    _add(app, 'POST', get_modules_tracking, 'modules_track/<run_uuid>')
    _add(app, 'POST', get_times_tracking, 'times_track/<run_uuid>')

    _add(app, 'POST', set_run, 'run/<run_uuid>')

    _add(app, 'POST', sign_in, 'auth/sign_in')
    _add(app, 'DELETE', sign_out, 'auth/sign_out')
