import json
import math
from glob import glob
from pathlib import Path
from typing import Dict, List, Any, Optional

import numpy as np
from labml import monit

from . import statuses
from . import settings

MAX_BUFFER_LENGTH = 1024
SMOOTH_POINTS = 50
MIN_SMOOTH_POINTS = 1
OUTLIER_MARGIN = 0.04


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
                iw = max(1., self.last_step[i] - last_step)
                jw = max(1., self.last_step[j] - self.last_step[i])
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
            'value': self.value,
            'smoothed': self.smooth_45()
        }

    def get_extent(self, is_remove_outliers: bool):
        if len(self.value) == 0:
            return [0, 0]
        elif len(self.value) < 10:
            return [min(self.value), max(self.value)]
        elif not is_remove_outliers:
            return [min(self.value), max(self.value)]

        values = np.sort(self.value)
        margin = int(len(values) * OUTLIER_MARGIN)
        std_dev = np.std(self.value[margin:-margin])
        start = 0
        while start < margin:
            if values[start] + std_dev * 2 > values[margin]:
                break
            start += 1
        end = len(values) - 1
        while end > len(values) - margin - 1:
            if values[end] - std_dev * 2 < values[-margin]:
                break
            end -= 1

        return [values[start], values[end]]

    def smooth_45(self) -> List[float]:
        forty_five = math.pi / 4
        hi = max(1, len(self.value) // MIN_SMOOTH_POINTS)
        lo = 1

        # angles = [self.mean_angle(self.smooth_value(m), 0.5) for m in range(lo, hi)]
        # print(angles)
        while lo < hi:
            m = (lo + hi) // 2
            smoothed = self.smooth_value(m)
            angle = self.mean_angle(smoothed, 0.5)
            if angle > forty_five:
                lo = m + 1
            else:
                hi = m

        return self.smooth_value(hi)

    def mean_angle(self, smoothed: List[float], aspect_ratio: float):
        x_range = max(self.last_step) - min(self.last_step)
        y_extent = self.get_extent(True)
        y_range = y_extent[1] - y_extent[0]
        # y_range = max(smoothed) - min(smoothed)

        if x_range < 1e-9 or y_range < 1e-9:
            return 0

        angles = []
        for i in range(len(smoothed) - 1):
            dx = (self.last_step[i + 1] - self.last_step[i]) / x_range
            dy = (smoothed[i + 1] - smoothed[i]) / y_range
            angles.append(math.atan2(abs(dy) * aspect_ratio, abs(dx)))

        return np.mean(angles)

    def smooth_value(self, span: Optional[int] = None) -> List[float]:
        if span is None:
            span = len(self.value) // SMOOTH_POINTS
        span_extra = span // 2

        n = 0
        total = 0
        smoothed = []
        for i in range(len(self.value) + span_extra):
            j = i - span_extra
            if i < len(self.value):
                total += self.value[i]
                n += 1
            if j - span_extra - 1 >= 0:
                total -= self.value[j - span_extra - 1]
                n -= 1
            if j >= 0:
                smoothed.append(total / n)

        return smoothed

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
                 name: str = '',
                 comment: str = '',
                 configs: Dict[str, any] = None,
                 tracking: List[Dict[str, any]] = None,
                 ):
        if configs is None:
            configs = {}
        if tracking is None:
            tracking = {}

        self.tracking = tracking
        self.configs = configs
        self.comment = comment
        self.name = name
        self.run_uuid = run_uuid
        self.labml_token = labml_token
        self.step = 0
        self.errors = []

    @property
    def url(self):
        return f'{settings.WEB_URL}/run?run_uuid={self.run_uuid}'

    def to_dict(self):
        return {
            'run_uuid': self.run_uuid,
            'labml_token': self.labml_token,
            'name': self.name,
            'comment': self.comment,
            'configs': self.configs,
        }

    def get_data(self):
        configs = [{'key': k, **c} for k, c in self.configs.items()]
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'configs': configs,
        }

    def get_tracking(self):
        res = []

        for k, s in self.tracking.items():
            series: Dict[str, Any] = s.summary
            name = k.split('.')
            if name[-1] == 'mean':
                name = name[:-1]
            series['name'] = '.'.join(name)
            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    def update(self, data: Dict[str, any]):
        if not self.name:
            self.name = data.get('name', '')
        if not self.comment:
            self.comment = data.get('comment', '')

        self.configs.update(data.get('configs', {}))

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


def get_run(run_uuid: str):
    if run_uuid in _RUNS:
        return _RUNS[run_uuid]

    return None


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
            status = statuses.get_status(run.run_uuid)
            # TODO create a model for this
            res.append({**run.get_data(), **status.to_dict()})

    return res


def _initialize():
    runs_path = Path(settings.DATA_PATH / 'runs')
    if not runs_path.exists():
        runs_path.mkdir(parents=True)

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
