import time
from functools import wraps

from typing import NamedTuple, Dict, Union
from mixpanel import Mixpanel

from ..auth import get_auth_user


class Event:
    def __init__(self):
        self.mp = Mixpanel("7e19de9c3c68ba5a897f19837042a826")

    def _track(self, identifier: str, event: str, data: Dict) -> None:

        return self.mp.track(identifier, event, data)

    def track(self, event: str, data: Union[NamedTuple, Dict]) -> None:
        if isinstance(data, NamedTuple):
            data = dict(data)

        user = get_auth_user()
        if user:
            identifier = user.email
        else:
            identifier = ''

        return self._track(identifier, event, data)

    def time_this(self, func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start = time.time()
            r = func(*args, **kwargs)
            end = time.time()
            self.track(func.__name__, {'time_elapsed': str(end - start)})

            return r

        return wrapper


MixPanelEvent = Event()
