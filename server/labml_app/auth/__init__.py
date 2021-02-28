import functools
import typing
from typing import Optional

import werkzeug.wrappers
from flask import request, make_response

from ..db import session
from ..db import project
from ..db import user
from .. import settings

request = typing.cast(werkzeug.wrappers.Request, request)


def get_session() -> session.Session:
    session_id = request.cookies.get('session_id')

    return session.get_or_create(session_id)


def check_labml_token_permission(func) -> functools.wraps:
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        labml_token = kwargs.get('labml_token', '')

        p = project.get_project(labml_token)
        if p and p.is_sharable:
            return func(*args, **kwargs)

        kwargs['labml_token'] = None

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

            if session_id != s.session_id:
                response.set_cookie('session_id', s.session_id, session.EXPIRATION_DELAY, domain=settings.DOMAIN)

            return response

    return wrapper


def get_auth_user() -> Optional[user.User]:
    s = get_session()

    u = None
    if s.user:
        u = s.user.load()

    return u


def get_is_user_logged() -> bool:
    s = get_session()

    if s.is_auth:
        return True

    return False
