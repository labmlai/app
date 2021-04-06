import time
from typing import Any, Dict, Callable
from uuid import uuid4
from functools import wraps

import flask
from flask import jsonify
from . import mix_panel


def check_version(user_v, new_v) -> bool:
    for uv, nw in zip(user_v.split('.'), new_v.split('.')):
        if int(nw) == int(uv):
            continue
        elif int(nw) > int(uv):
            return True
        else:
            return False


def gen_token() -> str:
    return uuid4().hex


def format_rv(data: Any, updated: Dict[str, Any] = None) -> flask.Response:
    meta = {'is_run_added': False}

    if updated:
        meta.update(updated)

    return jsonify({'data': data, 'meta': meta})


def time_this(function) -> Callable:
    @wraps(function)
    def time_wrapper(*args, **kwargs):
        start = time.time()
        r = function(*args, **kwargs)
        end = time.time()

        total_time = end - start
        print(function.__name__, total_time)

        return r

    return time_wrapper
