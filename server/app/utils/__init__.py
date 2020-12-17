from typing import Any
from uuid import uuid4

from flask import jsonify


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
    return jsonify({'data': data})
