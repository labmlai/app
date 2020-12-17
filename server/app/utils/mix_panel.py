import time
import queue
import threading
from functools import wraps
from typing import NamedTuple, Dict, Union

import mixpanel

from ..auth import get_auth_user

QUEUE = queue.Queue()


class EnqueueingConsumer(object):
    @staticmethod
    def send(endpoint, json_message, api_key=None):
        QUEUE.put([endpoint, json_message])


class Event:
    def __init__(self):
        self.mp = mixpanel.Mixpanel("7e19de9c3c68ba5a897f19837042a826", EnqueueingConsumer())

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

    def time_this(self, time_limit: float = 0.4):
        def decorator(function):
            def wrapper(*args, **kwargs):
                start = time.time()
                r = function(*args, **kwargs)
                end = time.time()

                total_time = end - start
                if total_time > time_limit:
                    self.track(function.__name__, {'time_elapsed': str(total_time)})

                return r

            return wrapper

        return decorator


class MixPanelThread(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.consumer = mixpanel.Consumer()

    def run(self):
        while True:
            job = QUEUE.get()
            self.consumer.send(*job)

            time.sleep(5)


MixPanelEvent = Event()
