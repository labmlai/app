import typing
import functools
import werkzeug.wrappers
from flask import request, make_response

from .. import users
from .. import sessions

request = typing.cast(werkzeug.wrappers.Request, request)


def process_parameters(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        _kwargs = {}
        for k, v in kwargs.items():
            if v == 'null':
                _kwargs[k] = ''
            else:
                _kwargs[k] = v

        return func(*args, **_kwargs)

    return wrapper


@process_parameters
def is_runs_permitted(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        labml_token = kwargs.get('labml_token', '')

        user = users.get(labml_token)
        if user and user.is_sharable:
            return func(*args, **kwargs)

        kwargs['labml_token'] = ''

        return func(*args, **kwargs)

    return wrapper


def login_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        session_id = request.cookies.get('session_id')
        session = sessions.get_or_create(session_id)
        if session.is_auth:
            return func(*args, **kwargs)
        else:
            response = make_response()
            response.status_code = 403

            print(session_id, session.session_id)
            if session_id != session.session_id:
                response.set_cookie('session_id', session.session_id)

            return response

    return wrapper
