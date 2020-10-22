import typing
import functools
import werkzeug.wrappers
from flask import request, make_response

from ..db import user
from ..db import session

request = typing.cast(werkzeug.wrappers.Request, request)


def process_parameters(func) -> functools.wraps:
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
def is_runs_permitted(func) -> functools.wraps:
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        labml_token = kwargs.get('labml_token', '')

        p = user.get_project(labml_token)
        if p and p.is_sharable:
            return func(*args, **kwargs)

        kwargs['labml_token'] = ''

        return func(*args, **kwargs)

    return wrapper


def login_required(func) -> functools.wraps:
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        session_id = request.cookies.get('session_id')
        s = session.get_or_create(session_id)
        if s.is_auth:
            return func(*args, **kwargs)
        else:
            response = make_response()
            response.status_code = 403

            print(session_id, s.session_id)
            if session_id != s.session_id:
                response.set_cookie('session_id', s.session_id)

            return response

    return wrapper
