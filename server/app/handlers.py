import typing
import flask
import werkzeug.wrappers
from flask import jsonify, request, make_response

from . import statuses
from . import users
from . import sessions
from . import runs

from .auth import login_required, is_runs_permitted

request = typing.cast(werkzeug.wrappers.Request, request)


def get_session() -> sessions.Session:
    session_id = request.cookies.get('session_id')

    return sessions.get_or_create(session_id)


def test():
    return jsonify({'uri': True})


def sign_in():
    json = request.json
    print(json)

    auth_o_info = users.AuthOInfo(**json)
    user = users.get_or_create_auth_o_user(auth_o_info)

    session_id = request.cookies.get('session_id')
    session = sessions.get_or_create(session_id)

    session.update({'labml_token': user.labml_token})

    response = make_response(jsonify({'is_successful': True}))

    print(session_id, session.session_id)
    if session_id != session.session_id:
        response.set_cookie('session_id', session.session_id)

    return response


def update_run():
    labml_token = request.args.get('labml_token')

    user = users.get(labml_token=labml_token)
    if not user:
        return jsonify({'errors': [{'error': 'invalid_labml_token',
                                    'message': 'The labml_token sent to the api is not valid.  '
                                               'Please create a valid token at https://web.lab-ml.com'}],
                        'success': False})

    json = request.json

    run_uuid = json.get('run_uuid', '')
    run = runs.get_or_create(run_uuid, labml_token)
    status = statuses.get_or_create(run_uuid)

    run.update(json)
    status.update(json)
    if 'track' in json:
        run.track(json['track'])

    return jsonify({'errors': run.errors, 'url': run.url})


@login_required
def get_run(run_uuid: str):
    run_data = {}
    run = runs.get_run(run_uuid)
    if run:
        run_data = run.get_data()

    print('run', run_uuid)

    return jsonify(run_data)


@login_required
def get_status(run_uuid: str):
    status_data = {}
    status = statuses.get_status(run_uuid)
    if status:
        status_data = status.to_dict()

    print('status', run_uuid)

    return jsonify(status_data)


@login_required
@is_runs_permitted
def get_runs(labml_token: str):
    session = get_session()

    if labml_token:
        labml_token = labml_token
    else:
        labml_token = session.labml_token

    print('runs', labml_token)

    return jsonify({'runs': runs.get_runs(labml_token), 'labml_token': labml_token})


@login_required
def get_tracking(run_uuid: str):
    track_data = []
    run = runs.get_run(run_uuid)
    if run:
        track_data = run.get_tracking()

    print('tracking', run_uuid)

    return jsonify(track_data)


def _add(app: flask.Flask, method: str, func: typing.Callable, url: str = None):
    if url is None:
        url = func.__name__

    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add(app, 'GET', test, 'test')

    _add(app, 'POST', update_run, 'track')

    _add(app, 'GET', get_runs, 'runs/<labml_token>')

    _add(app, 'GET', get_run, 'run/<run_uuid>')
    _add(app, 'GET', get_status, 'status/<run_uuid>')
    _add(app, 'POST', get_tracking, 'track/<run_uuid>')

    _add(app, 'POST', sign_in, 'auth/sign_in')
