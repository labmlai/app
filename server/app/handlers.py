import typing
import flask
import werkzeug.wrappers

from typing import Any
from flask import jsonify, request, make_response, redirect

from labml_db import Key

from .db import user
from .db import status
from .db import session
from .db import run

from .enums import Enums
from . import settings
from .logs.logger import LOGGER

from .auth import login_required, is_runs_permitted, get_session

request = typing.cast(werkzeug.wrappers.Request, request)


def default() -> flask.Response:
    return make_response(redirect(settings.WEB_URL))


def sign_in() -> flask.Response:
    json = request.json

    info = user.AuthOInfo(**json)
    u = user.get_or_create_user(info)

    session_id = request.cookies.get('session_id')
    s = session.get_or_create(session_id)

    s.user = u.key
    s.save()

    response = make_response(jsonify({'is_successful': True}))

    if session_id != s.session_id:
        response.set_cookie('session_id', s.session_id)

    LOGGER.info(f'sign_in, user: {u.key}')

    return response


def sign_out() -> flask.Response:
    session_id = request.cookies.get('session_id')
    s = session.get_or_create(session_id)

    session.delete(s)

    response = make_response(jsonify({'is_successful': True}))

    if session_id != s.session_id:
        response.set_cookie('session_id', s.session_id)

    LOGGER.info(f'sign_out, session_id: {s.session_id}')

    return response


def update_run() -> flask.Response:
    success = True
    error = {}

    labml_token = request.args.get('labml_token')

    p = user.get_project(labml_token=labml_token)
    if not p:
        labml_token = settings.FLOAT_PROJECT_TOKEN

    run_uuid = request.json.get('run_uuid', '')
    r = run.get(run_uuid, labml_token)
    if not r and not p:
        error = {'error': 'invalid or empty labml_token',
                 'message': 'Please create a valid token at https://web.lab-ml.com'
                            'Click on the experiment link to monitor the experiment and add it to your experiments list.'}

    r = run.get_or_create(run_uuid, labml_token)
    s = r.status.load()

    r.update_run(request.json)
    s.update_time_status(request.json)
    if 'track' in request.json:
        r.track(request.json['track'])

    if error:
        success = False
        r.errors.append(error)

    LOGGER.info(f'update_run, run_uuid: {run_uuid}')

    return jsonify({'errors': r.errors, 'url': r.url, 'success': success})


def set_run(run_uuid: str) -> flask.Response:
    data = request.json

    r = run.get_run(run_uuid)
    r.update_preferences(data)

    LOGGER.info(f'update_preferences, run_uuid: {run_uuid}')

    return jsonify({'errors': r.errors})


def claim_run(run_uuid: str, run_key=Key[run.Run]) -> None:
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

    LOGGER.info(f'run, run_uuid: {run_uuid}')

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

    LOGGER.info(f'status, run_uuid: {run_uuid}')

    return response


@login_required
@is_runs_permitted
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

    LOGGER.info(f'runs, labml_token : {labml_token}')

    return jsonify({'runs': res, 'labml_token': labml_token})


@login_required
def get_user() -> Any:
    s = get_session()

    u = s.user.load()
    LOGGER.info(f'get_user, user : {u.key}')

    return jsonify(u.get_data())


@login_required
def get_metrics_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    r = run.get_run(run_uuid)
    if r:
        track_data = r.get_tracking(Enums.METRIC)
        status_code = 200

    LOGGER.info(f'metrics_tracking, run_uuid : {run_uuid}')

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

    LOGGER.info(f'params_tracking, run_uuid : {run_uuid}')

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

    LOGGER.info(f'modules_tracking, run_uuid : {run_uuid}')

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

    LOGGER.info(f'times_tracking, run_uuid : {run_uuid}')

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

    LOGGER.info(f'grads_tracking, run_uuid : {run_uuid}')

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


def _add(app: flask.Flask, method: str, func: typing.Callable, url: str = None):
    if url is None:
        url = func.__name__

    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add(app, 'GET', default, '/')

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
