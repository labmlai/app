import json
import time

from glob import glob
from pathlib import Path
from typing import Dict, Union

from labml import monit

from .enums import Enums

from . import settings


class RunStatus:
    def __init__(self, *,
                 status: str = '',
                 details=None,
                 time: float = None,
                 ):
        self.status = status
        self.details = details
        self.time = time

    def to_dict(self):
        return {
            'status': self.status,
            'details': self.details,
            'time': self.time,
        }


class Status:
    def __init__(self, *,
                 run_uuid: str,
                 start_time: float = None,
                 last_updated_time: float = None,
                 status: Union[RunStatus, Dict] = None,
                 ):
        if isinstance(status, dict):
            status = RunStatus(**status)

        if status is None:
            status = RunStatus(**{"status": Enums.RUN_IN_PROGRESS, "details": None, "time": last_updated_time})

        self.run_uuid = run_uuid
        self.start_time = start_time
        self.last_updated_time = last_updated_time
        self.status = status

    def to_dict(self):
        return {
            'run_uuid': self.run_uuid,
            'start_time': self.start_time,
            'last_updated_time': self.last_updated_time,
            'status': self.status.to_dict()
        }

    def update(self, data: Dict[str, any]):
        self.last_updated_time = time.time()

        status = data.get('status', {})
        if status:
            self.status.status = status.get('status', self.status.status)
            self.status.details = status.get('details', self.status.details)
            self.status.time = status.get('time', self.status.time)

        self.save()

    def save(self):
        data = self.to_dict()
        with open(str(settings.DATA_PATH / 'runs' / f'{self.run_uuid}.status.json'), 'w') as f:
            json.dump(data, f, indent=4)


_STATUS: Dict[str, Status] = {}


def get_status(run_uuid: str):
    if run_uuid in _STATUS:
        return _STATUS[run_uuid]

    return None


def _initialize():
    runs_path = Path(settings.DATA_PATH / 'runs')
    if not runs_path.exists():
        runs_path.mkdir(parents=True)

    for f_name in glob(f'{runs_path}/*.json'):
        if 'status' in f_name:
            with open(f_name, 'r') as f:
                data = json.load(f)
                status = Status(**data)
                _STATUS[status.run_uuid] = status


def get_or_create(run_uuid: str):
    if run_uuid in _STATUS:
        return _STATUS[run_uuid]

    path = Path(settings.DATA_PATH / 'runs' / f'{run_uuid}.status.json')
    if not path.exists():
        time_now = time.time()
        status = Status(run_uuid=run_uuid, start_time=time_now, last_updated_time=time_now)
        status.save()

        _STATUS[status.run_uuid] = status
        return status

    with open(str(path), 'r') as f:
        data = json.load(f)

    status = Status(**data)
    _STATUS[status.run_uuid] = status

    return status


with monit.section("Initialize status"):
    _initialize()
