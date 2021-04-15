import math
from typing import Dict, List, Optional, Union

import numpy as np

MAX_BUFFER_LENGTH = 1024
SMOOTH_POINTS = 50
MIN_SMOOTH_POINTS = 1
OUTLIER_MARGIN = 0.04

SeriesModel = Dict[str, Union[np.ndarray, List[float], float]]


class Series:
    step: np.ndarray
    last_step: np.ndarray
    value: np.ndarray
    smoothed: List[float]
    is_smoothed_updated: bool
    step_gap: float
    max_buffer_length: int

    def __init__(self, max_buffer_length: int = None):
        self.step = np.array([])
        self.last_step = np.array([])
        self.value = np.array([])
        self.smoothed = []
        self.is_smoothed_updated = False
        self.step_gap = 0
        if max_buffer_length:
            self.max_buffer_length = max_buffer_length
        else:
            self.max_buffer_length = MAX_BUFFER_LENGTH

    @property
    def last_value(self) -> float:
        return self.value[-1]

    @property
    def detail(self) -> Dict[str, List[float]]:
        if not self.smoothed or len(self.smoothed) != len(self.step):
            self.smoothed = self.smooth_45()
            self.is_smoothed_updated = True
        else:
            self.is_smoothed_updated = False

        return {
            'step': self.last_step.tolist(),
            'value': self.value.tolist(),
            'smoothed': self.smoothed,
            'mean': np.mean(self.value),
        }

    @property
    def summary(self) -> Dict[str, np.ndarray]:
        return {
            'mean': np.mean(self.value)
        }

    def to_data(self) -> SeriesModel:
        return {
            'step': self.step,
            'value': self.value,
            'last_step': self.last_step,
            'smoothed': self.smoothed,
            'is_smoothed_updated': self.is_smoothed_updated,
            'step_gap': self.step_gap
        }

    def __len__(self):
        return len(self.last_step)

    def update(self, steps: List[float], values: List[float]) -> None:
        start_step = len(self.value)
        values = np.array(values)
        steps = np.array(steps)
        last_step = np.array(steps)

        self._remove_nan(values)

        if start_step:
            values = np.concatenate((self.value[-1:], values))
            steps = np.concatenate((self.step[-1:], steps))
            last_step = np.concatenate((self.last_step[-1:], last_step))

        self.merge_n(start_step, values, last_step, steps)

        while len(self) > self.max_buffer_length:
            self.step_gap *= 2
            self.merge()

    def _remove_nan(self, values) -> None:
        infin = np.isfinite(values)
        np.bitwise_not(infin, out=infin)

        if infin[0]:
            values[0] = 0.0 if len(self.value) == 0 else self.value[-1]
        for i in range(1, len(values)):
            if infin[i]:
                values[i] = values[i - 1]

    def _find_gap(self, last_step) -> None:
        if not self.step_gap:
            if len(self) > 1:
                gap = self.last_step[1:] - self.last_step[:-1]
            else:
                gap = last_step[1:] - last_step[:-1]

            self.step_gap = gap.max().item()

    def merge_n(self, start_step, values, last_step, steps):
        if len(last_step) > 1:
            self._find_gap(last_step)

            i = 0
            j = 1
            ls = 0
            while j < len(values):
                if last_step[j] - ls < self.step_gap:
                    # merge
                    iw = max(1., last_step[i] - ls)
                    jw = max(1., last_step[j] - last_step[i])
                    steps[i] = (steps[i] * iw + steps[j] * jw) / (iw + jw)
                    values[i] = (values[i] * iw + values[j] * jw) / (iw + jw)
                    last_step[i] = last_step[j]
                    j += 1
                else:
                    ls = last_step[i]
                    i += 1
                    last_step[i] = last_step[j]
                    steps[i] = steps[j]
                    values[i] = values[j]
                    j += 1

            i += 1
            last_step = last_step[:i]
            steps = steps[:i]
            values = values[:i]

        if start_step:
            self.value = np.concatenate((self.value[:-1], values))
            self.step = np.concatenate((self.step[:-1], steps))
            self.last_step = np.concatenate((self.last_step[:-1], last_step))
        else:
            self.value = np.concatenate((self.value, values))
            self.step = np.concatenate((self.step, steps))
            self.last_step = np.concatenate((self.last_step, last_step))

    def merge(self) -> None:
        if len(self) == 1:
            return

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

    def get_extent(self, is_remove_outliers: bool):
        if len(self.value) == 0:
            return [0, 0]
        elif len(self.value) < 10:
            return [min(self.value), max(self.value)]
        elif not is_remove_outliers:
            return [min(self.value), max(self.value)]

        values = np.sort(self.value)
        margin = max(int(len(values) * OUTLIER_MARGIN), 1)
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

        while lo < hi:
            m = (lo + hi) // 2
            smoothed = self.smooth_value(m)
            angle = self.mean_angle(smoothed, 0.5)
            if angle > forty_five:
                lo = m + 1
            else:
                hi = m

        return self.smooth_value(hi)

    def mean_angle(self, smoothed: List[float], aspect_ratio: float) -> Union[np.ndarray, float]:
        x_range = max(self.last_step) - min(self.last_step)
        y_extent = self.get_extent(True)
        y_range = y_extent[1] - y_extent[0]

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

    def load(self, data):
        self.step = data['step'].copy()
        self.last_step = data['last_step'].copy()
        self.value = data['value'].copy()
        if 'smoothed' in data:
            self.smoothed = data['smoothed'].copy()
        else:
            self.smoothed = []

        return self
