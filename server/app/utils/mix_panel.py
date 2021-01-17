import queue
import re
import threading
import time
from functools import wraps
from typing import NamedTuple, Dict, Union

from flask import request

try:
    import mixpanel
except ImportError:
    mixpanel = None

from .. import auth

QUEUE = queue.Queue()


class EnqueueingConsumer(object):
    @staticmethod
    def send(endpoint, json_message, api_key=None):
        QUEUE.put([endpoint, json_message])


class Event:
    def __init__(self):
        if mixpanel:
            self.__mp = mixpanel.Mixpanel("7e19de9c3c68ba5a897f19837042a826", EnqueueingConsumer())
        else:
            self.__mp = None

    def _track(self, identifier: str, event: str, data: Dict):
        if self.__mp:
            self.__mp.track(identifier, event, data)

    def people_set(self, identifier: str, first_name: str, last_name: str, email: str):
        if self.__mp:
            self.__mp.people_set(identifier, {
                '$first_name': first_name,
                '$last_name': last_name,
                '$email': email,
            })

    @staticmethod
    def has_numbers(input_string):
        return bool(re.search(r'\d', input_string))

    def get_meta_data(self) -> Dict[str, str]:
        run_uuid = request.args.get('run_uuid', '')
        computer_uuid = request.args.get('computer_uuid', '')

        uuid = ''
        if run_uuid:
            uuid = run_uuid
        elif computer_uuid:
            uuid = computer_uuid
        else:
            value = request.base_url.split('/')[-1]
            if self.has_numbers(value):
                uuid = value

        if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
            remote_addr = request.environ['REMOTE_ADDR']
        else:
            remote_addr = request.environ['HTTP_X_FORWARDED_FOR']  # if behind a proxy

        meta = {'remote_ip': remote_addr,
                'uuid': uuid,
                'labml_token': request.args.get('labml_token', ''),
                'labml_version': request.args.get('labml_version', ''),
                'agent': request.headers['User-Agent']
                }

        return meta

    def track(self, event: str, data: Union[NamedTuple, Dict]) -> None:
        if isinstance(data, NamedTuple):
            data = dict(data)

        user = auth.get_auth_user()
        if user:
            identifier = user.email
        else:
            identifier = ''

        data.update(self.get_meta_data())

        return self._track(identifier, event, data)

    def time_this(self, time_limit: float = None):
        def decorator_function(function):
            @wraps(function)
            def time_wrapper(*args, **kwargs):
                start = time.time()
                r = function(*args, **kwargs)
                end = time.time()

                total_time = end - start
                if time_limit and total_time < time_limit:
                    return r

                self.track(function.__name__, {'time_elapsed': str(total_time)})

                return r

            return time_wrapper

        return decorator_function


class MixPanelThread(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        if mixpanel:
            self.__consumer = mixpanel.Consumer()
        else:
            self.__consumer = None

    def run(self):
        while True:
            job = QUEUE.get()
            if self.__consumer:
                self.__consumer.send(*job)

            time.sleep(5)


MixPanelEvent = Event()
