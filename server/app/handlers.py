import time
import typing

import flask
import werkzeug.wrappers
from flask import jsonify, request, make_response, redirect

from . import runs
from . import settings
from . import users, tasks
from .enums import Enums
from .slack import authorize
from .slack.message import SlackMessage

request = typing.cast(werkzeug.wrappers.Request, request)

NOTIFICATION_DELAY = 120


def test():
    division_by_zero = 1 / 0


def slack_signup():
    return jsonify({
        'uri': authorize.gen_authorize_uri("stateless")
    })


def slack_authenticated():
    access_token_result = authorize.get_access_token(request.args.get('code'))

    slack_token = access_token_result.get('access_token', '')

    user = users.get_or_create(slack_token=slack_token)

    return make_response(redirect(f"{settings.WEB_URL}/?labml_token={user.labml_token}"))


def signup():
    user = users.get_or_create()

    return jsonify({
        'uri': f"{settings.WEB_URL}/?labml_token={user.labml_token}"
    })


def update_run():
    channel = request.args.get('channel')
    labml_token = request.args.get('labml_token')

    user = users.get(labml_token=labml_token)
    if not user:
        return jsonify({'errors': 'invalid_labml_token',
                        'message': 'The labml_token sent to the api is not valid.'
                                   ' Please create a valid token at https://web.lab-ml.com',
                        'success': False})

    json = request.json
    run_uuid = json.get('run_uuid', '')
    run = runs.get_or_create(run_uuid, labml_token)

    run.update(json)
    if 'track' in json:
        run.track(json['track'])

    if channel and (not run.last_notified or run.status['status'] != Enums.RUN_IN_PROGRESS):
        run.last_notified = time.time()
        message = SlackMessage(user.slack_token)
        tasks.post_slack_message(message, channel, run)

    return jsonify({'errors': run.errors, 'url': run.url})


def get_run(run_uuid: str):
    run = runs.get_or_create(run_uuid)
    return jsonify(run.get_data())


def get_runs(labml_token: str):
    return jsonify(runs.get_runs(labml_token))


def get_tracking(run_uuid: str):
    run = runs.get_or_create(run_uuid)
    return jsonify(run.get_tracking())


def _add(app: flask.Flask, method: str, func: typing.Callable, url: str = None):
    if url is None:
        url = func.__name__

    app.add_url_rule(f'/api/v1/{url}', view_func=func, methods=[method])


def add_handlers(app: flask.Flask):
    _add(app, 'GET', test, 'test')

    _add(app, 'POST', signup, 'signup')
    _add(app, 'GET', slack_authenticated, 'auth/redirect')
    _add(app, 'POST', update_run, 'track')

    _add(app, 'GET', get_run, 'run/<run_uuid>')
    _add(app, 'GET', get_runs, 'runs/<labml_token>')
    _add(app, 'POST', get_tracking, 'track/<run_uuid>')
