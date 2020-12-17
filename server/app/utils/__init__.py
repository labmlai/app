from typing import Any
from uuid import uuid4

from flask import jsonify

from ..auth import get_auth_user


def check_version(user_v, new_v):
    for uv, nw in zip(user_v.split('.'), new_v.split('.')):
        if int(nw) == int(uv):
            continue
        elif int(nw) > int(uv):
            return True
        else:
            return False


def gen_token() -> str:
    return uuid4().hex


def format_rv(data: Any):
    u = get_auth_user()

    is_run_added = False
    if u:
        default_project = u.default_project
        is_run_added = default_project.is_run_added

    return jsonify({'data': data, 'meta': {'is_run_added': is_run_added}})
