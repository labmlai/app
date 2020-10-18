import math
import time
import numpy as np

from typing import Dict, List, Optional, Any, Union
from uuid import uuid4

from labml_db import Model, Key, Index

from . import user
from .. import settings


def generate_run_uuid() -> str:
    return uuid4().hex


MAX_BUFFER_LENGTH = 1024
SMOOTH_POINTS = 50
MIN_SMOOTH_POINTS = 1
OUTLIER_MARGIN = 0.04


class Series(Model['Series']):
    step: List[float]
    last_step: List[float]
    value: List[float]
    step_gap: float

    @classmethod
    def defaults(cls):
        return dict(step=[],
                    last_step=[],
                    value=[],
                    step_gap=0
                    )

    @property
    def last_value(self):
        return self.value[-1]

    @property
    def summary(self):
        return {
            'step': self.last_step,
            'value': self.value,
            'smoothed': self.smooth_45()
        }

    def update_series(self, steps: List[float], values: List[float]):
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


SeriesModel = Dict[str, List[float]]


class Run(Model['Run']):
    name: str
    comment: str
    start_time: float
    run_uuid: str
    tracking: Dict[str, Key[Series]]
    configs: Dict[str, any]
    step: int
    errors: List[str]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    comment='',
                    start_time=None,
                    run_uuid='',
                    tracking={},
                    configs={},
                    step=0,
                    errors=[]
                    )

    @property
    def url(self) -> str:
        return f'{settings.WEB_URL}/run?run_uuid={self.run_uuid}'

    def update_run(self, data: Dict[str, any]) -> None:
        if not self.name:
            self.name = data.get('name', '')
        if not self.comment:
            self.comment = data.get('comment', '')
        if not self.configs:
            self.configs.update(data.get('configs', {}))

        self.save()

    def get_data(self) -> Dict:
        configs = [{'key': k, **c} for k, c in self.configs.items()]
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
            'configs': configs,
        }

    def get_tracking(self) -> List:
        res = []

        for k, s in self.tracking.items():
            series: Dict[str, Any] = s.load().summary
            name = k.split('.')
            if name[-1] == 'mean':
                name = name[:-1]
            series['name'] = '.'.join(name)
            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    def track(self, data: Dict[str, SeriesModel]) -> None:
        for ind, series in data.items():
            self.step = max(self.step, series['step'][-1])
            self._update_series(ind, series)

    def _update_series(self, ind: str, series: SeriesModel) -> None:
        if ind not in self.tracking:
            s = Series()
            s.save()

            self.tracking[ind] = s.key
            self.save()

        s = self.tracking[ind].load()
        s.update_series(series['step'], series['value'])
        s.save()


class RunIndex(Index['Run']):
    pass


def get_or_create(run_uuid: str, labml_token: str = '') -> Run:
    project = user.get_project(labml_token)

    if run_uuid in project.runs:
        return project.runs[run_uuid].load()

    time_now = time.time()
    run = Run(run_uuid=run_uuid,
              start_time=time_now
              )
    project.runs[run.run_uuid] = run.key

    run.save()
    project.save()

    RunIndex.set(run.run_uuid, run.key)

    return run


def get_runs(labml_token: str) -> List:
    res = []
    project = user.get_project(labml_token)
    for run_uuid, run_key in project.runs.items():
        res.append(run_key.load())

    return res


def get_run(run_uuid: str) -> Union[None, Run]:
    run_key = RunIndex.get(run_uuid)

    if run_key:
        return run_key.load()

    return None
