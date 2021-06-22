import time
import functools
from typing import Callable
from uuid import uuid4
from functools import wraps

from fastapi import Request, Response
from fastapi.responses import JSONResponse
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


def api_endpoint(func) -> functools.wraps:
    @functools.wraps(func)
    async def wrapper(request: Request, *args, **kwargs) -> Response:
        res = await func(request, *args, **kwargs)
        response = JSONResponse(res)
        if not res:
            response.status_code = 404
        return response

    return wrapper


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
