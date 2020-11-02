import time
from functools import wraps

from .logger import LOGGER


def time_this(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        r = func(*args, **kwargs)
        end = time.time()
        LOGGER.info(f'{func.__name__} : {end - start}')
        return r

    return wrapper
