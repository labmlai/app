import typing

import flask
import werkzeug.wrappers
from flask import jsonify, request

from . import runs
from . import settings
from . import users
from .auth import google

request = typing.cast(werkzeug.wrappers.Request, request)

NOTIFICATION_DELAY = 120


def test():
    division_by_zero = 1 / 0


def google_sign_in():
    json = request.json
    user = google.sign_in(json['token'])

    return jsonify({'uri': f"{settings.WEB_URL}/runs?labml_token={user.labml_token}"})


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

    run.update(json)
    if 'track' in json:
        run.track(json['track'])

    return jsonify({'errors': run.errors, 'url': run.url})


def get_run(run_uuid: str):
    run_data = {}
    run = runs.get_run(run_uuid)
    if run:
        run_data = run.get_data()

    return jsonify(run_data)


def get_runs(labml_token: str):
    return jsonify({'runs': runs.get_runs(labml_token), 'is_valid_user': users.is_valid_user(labml_token)})


def get_tracking(run_uuid: str):
    track_data = []
    run = runs.get_run(run_uuid)
    if run:
        track_data = run.get_tracking()

    return jsonify(track_data)


def _add(app: flask.Flask, method: str, func: typing.Callable, url: str = None):
    if url is None:
        url = func.__name__

    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add(app, 'GET', test, 'test')

    _add(app, 'POST', update_run, 'track')

    _add(app, 'GET', get_run, 'run/<run_uuid>')
    _add(app, 'GET', get_runs, 'runs/<labml_token>')
    _add(app, 'POST', get_tracking, 'track/<run_uuid>')

    _add(app, 'POST', google_sign_in, 'auth/google/sign_in')
