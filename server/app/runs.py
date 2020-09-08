import json
from glob import glob
from pathlib import Path
from typing import Dict, List, Any

import numpy as np
from labml import monit

from . import settings
from .enums import Enums

MAX_BUFFER_LENGTH = 1024


class Series:
    step: List[float]
    last_step: List[float]
    value: List[float]
    step_gap: float

    def __init__(self):
        self.step = []
        self.last_step = []
        self.value = []
        self.step_gap = 0

    @property
    def last_value(self):
        return self.value[-1]

    def update(self, steps: List[float], values: List[float]):
        self.step += steps.copy()
        self.value += values.copy()
        self.last_step += steps.copy()

        self.merge()
        while len(self) > MAX_BUFFER_LENGTH:
            self.step_gap *= 2
            self.merge()

    def _find_gap(self):
        if self.step_gap:
            return
        assert len(self) > 1

        last_step = np.array(self.last_step)
        gap = last_step[1:] - last_step[:-1]
        self.step_gap = gap.max().item()

    def merge(self):
        if len(self) == 1:
            return

        self._find_gap()

        i = 0
        j = 1
        last_step = 0
        while j < len(self):
            if self.last_step[j] - last_step < self.step_gap:
                # merge
                iw = self.last_step[i] - last_step
                jw = self.last_step[j] - self.last_step[i]
                self.step[i] = (self.step[i] * iw + self.step[j] * jw) / (iw + jw)
                self.value[i] = (self.value[i] * iw + self.value[j] * jw) / (iw + jw)
                self.last_step[i] = self.last_step[j]
                j += 1
            else:
                last_step = self.last_step[i]
                i += 1
                self.last_step[i] = self.last_step[j]
                self.step[i] = self.step[j]
                self.value[i] = self.value[j]
                j += 1

        i += 1
        self.last_step = self.last_step[:i]
        self.step = self.step[:i]
        self.value = self.value[:i]

    def __len__(self):
        return len(self.last_step)

    @property
    def summary(self):
        return {
            'step': self.last_step,
            'value': self.value
        }

    def to_dict(self):
        return {
            'step': self.step,
            'last_step': self.last_step,
            'value': self.value
        }

    def load(self, data):
        self.step = data['step']
        self.last_step = data['last_step']
        self.value = data['value']


# class SeriesModel(TypedDict):
#     step: List[float]
#     value: List[float]
SeriesModel = Dict[str, List[float]]


class Run:
    tracking: Dict[str, Series]

    def __init__(self, *,
                 run_uuid: str,
                 labml_token: str = '',
                 slack_thread_ts: str = '',
                 file_id: str = '',
                 name: str = '',
                 comment: str = '',
                 start: float = None,
                 time: float = None,
                 configs: Dict[str, any] = None,
                 status: Dict[str, any] = None,
                 tracking: List[Dict[str, any]] = None):
        if configs is None:
            configs = {}
        if tracking is None:
            tracking = {}
        if status is None:
            status = {"status": Enums.RUN_IN_PROGRESS, "details": None, "time": time}

        self.tracking = tracking
        self.configs = configs
        self.status = status
        self.start = start
        self.comment = comment
        self.name = name
        self.time = time
        self.run_uuid = run_uuid
        self.labml_token = labml_token
        self.slack_thread_ts = slack_thread_ts
        self.file_id = file_id
        self.step = 0
        self.errors = []
        self.last_notified = 0.

    @property
    def url(self):
        return f'{settings.WEB_URL}/run?run_uuid={self.run_uuid}'

    def to_dict(self):
        return {
            'run_uuid': self.run_uuid,
            'labml_token': self.labml_token,
            'slack_thread_ts': self.slack_thread_ts,
            'file_id': self.file_id,
            'name': self.name,
            'comment': self.comment,
            'start': self.start,
            'time': self.time,
            'configs': self.configs,
            'status': self.status,
        }

    def get_data(self):
        configs = [{'key': k, **c} for k, c in self.configs.items()]
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'configs': configs,
            'start': self.start,
            'time': self.time,
            'status': self.status
        }

    def get_tracking(self):
        res = []

        is_plot_count = 0
        for k, s in self.tracking.items():
            series: Dict[str, Any] = s.summary
            name = k.split('.')
            if name[-1] == 'mean':
                name = name[:-1]
            series['name'] = '.'.join(name)
            if name[0] == 'loss':
                series['is_plot'] = True
                is_plot_count += 1
            else:
                series['is_plot'] = False
            res.append(series)

        if is_plot_count == 0:
            for series in res:
                if series['name'].find('loss') != -1:
                    series['is_plot'] = True
                    is_plot_count += 1

        res.sort(key=lambda s: f"{int(not s['is_plot'])}{s['name']}")

        if is_plot_count == 0 and res:
            res[0]['is_plot'] = True

        return res

    def update(self, data: Dict[str, any]):
        if not self.name:
            self.name = data.get('name', '')
        if not self.comment:
            self.comment = data.get('comment', '')
        if not self.start:
            self.start = data.get('time', None)
        self.time = data.get('time', self.time)

        self.configs.update(data.get('configs', {}))
        if data.get('status', {}):
            self.status.update(data.get('status', {}))

        self.save()

    def track(self, data: Dict[str, SeriesModel]):
        for ind, series in data.items():
            self._update_series(ind, series)
            self.step = max(self.step, series['step'][-1])

        self.save_tracking()

    def _update_series(self, ind: str, series: SeriesModel):
        if ind not in self.tracking:
            self.tracking[ind] = Series()

        self.tracking[ind].update(series['step'], series['value'])

    def save(self):
        data = self.to_dict()
        with open(str(settings.DATA_PATH / 'runs' / f'{self.run_uuid}.json'), 'w') as f:
            json.dump(data, f, indent=4)

    def save_tracking(self):
        data = {k: s.to_dict() for k, s in self.tracking.items()}
        data['step'] = self.step
        with open(str(settings.DATA_PATH / 'runs' / f'{self.run_uuid}.tracking.json'), 'w') as f:
            json.dump(data, f, indent=4)

    def load_tracking(self):
        try:
            with open(str(settings.DATA_PATH / 'runs' / f'{self.run_uuid}.tracking.json'), 'r') as f:
                data = json.load(f)

            self.step = data['step']
            del data['step']

            for k, s in data.items():
                self.tracking[k] = Series()
                self.tracking[k].load(s)
        except FileNotFoundError as e:
            print(f'file not found{e.filename}')


_RUNS: Dict[str, Run] = {}


def get_or_create(run_uuid: str, labml_token: str = ''):
    if run_uuid in _RUNS:
        return _RUNS[run_uuid]

    path = Path(settings.DATA_PATH / 'runs' / f'{run_uuid}.json')
    if not path.exists():
        run = Run(run_uuid=run_uuid, labml_token=labml_token)
        run.save()

        _RUNS[run.run_uuid] = run
        return run

    with open(str(path), 'r') as f:
        data = json.load(f)

    run = Run(**data)
    run.load_tracking()
    _RUNS[run.run_uuid] = run

    return run


def get_runs(labml_token: str):
    res = []
    for run_uuid, run in _RUNS.items():
        if run.labml_token == labml_token:
            res.append(run.get_data())

    return res


def _initialize():
    runs_path = Path(settings.DATA_PATH / 'runs')
    if not runs_path.exists():
        runs_path.mkdir(parents=True)

    image_path = Path(settings.DATA_PATH / 'images')
    if not image_path.exists():
        image_path.mkdir(parents=True)

    for f_name in glob(f'{runs_path}/*.json'):
        if 'tracking' in f_name:
            continue

        with open(f_name, 'r') as f:
            data = json.load(f)

        run = Run(**data)
        run.load_tracking()
        _RUNS[run.run_uuid] = run


with monit.section("Initialize runs"):
    _initialize()
