import time
from functools import wraps

from .logging import logger

_all__ = ["logger"]


def time_this(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        r = func(*args, **kwargs)
        end = time.time()
        logger.info(f'{func.__name__} : {end - start}')
        return r

    return wrapper
