import time
from typing import Dict, List, Optional, Union, NamedTuple
from uuid import uuid4

from labml_db import Model, Key, Index
from . import user
from .series_collection import SeriesCollection
from .status import create_status, Status
from .. import settings
from ..analyses.series import SeriesModel
from ..enums import SeriesEnums

INDICATORS = [SeriesEnums.GRAD, SeriesEnums.PARAM, SeriesEnums.TIME, SeriesEnums.MODULE, SeriesEnums.METRIC]


def generate_run_uuid() -> str:
    return uuid4().hex


class CardInfo(NamedTuple):
    class_name: str
    name: str
    is_print: bool
    queue_size: int = 0


class RunPreferences(Model['RunPreferences']):
    series_preferences: Dict[str, List[int]]

    @classmethod
    def defaults(cls):
        return dict(series_preferences={})

    def update_preferences(self, data: Dict[str, any]) -> None:
        for k, v in data.items():
            if v:
                self.series_preferences[k] = v

        self.save()


class Run(Model['Run']):
    name: str
    comment: str
    start_time: float
    run_ip: str
    run_uuid: str
    status: Key[Status]
    series: Key[SeriesCollection]
    run_preferences: Key[RunPreferences]
    configs: Dict[str, any]
    wildcard_indicators: Dict[str, Dict[str, Union[str, bool]]]
    indicators: Dict[str, Dict[str, Union[str, bool]]]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(name='',
                    comment='',
                    start_time=None,
                    run_uuid='',
                    run_ip='',
                    series=None,
                    status=None,
                    run_preferences=None,
                    configs={},
                    wildcard_indicators={},
                    indicators={},
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
        if not self.indicators:
            self.indicators = data.get('indicators', {})
        if not self.wildcard_indicators:
            self.wildcard_indicators = data.get('wildcard_indicators', {})

        self.save()

    def update_preferences(self, data: Dict[str, any]) -> None:
        rp = self.run_preferences.load()
        rp.update_preferences(data)

    def get_data(self) -> Dict[str, Union[str, any]]:
        configs = [{'key': k, **c} for k, c in self.configs.items()]
        rp = self.run_preferences.load()

        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
            'configs': configs,
            'series_preferences': rp.series_preferences,
            'indicator_types': self.get_indicator_types()
        }

    def get_summary(self) -> Dict[str, str]:
        return {
            'run_uuid': self.run_uuid,
            'name': self.name,
            'comment': self.comment,
            'start_time': self.start_time,
        }

    def get_indicator_types(self):
        indicator_types = {ind: False for ind in INDICATORS}

        for ind in self.indicators:
            ind_type = ind.split('.')[0]
            if ind_type in indicator_types.keys():
                indicator_types[ind_type] = True
            else:
                indicator_types[SeriesEnums.METRIC] = True

        return indicator_types

    def track(self, data: Dict[str, SeriesModel]) -> None:
        series = self.series.load()
        series.track(data)

    def get_tracking(self, track_type: str) -> List:
        series = self.series.load()

        res = []
        tracks = series.types[track_type]
        for track in tracks:
            if track_type not in [SeriesEnums.METRIC, SeriesEnums.TIME]:
                if 'l2' not in track:
                    continue
            res.append(series.get_track(track))

        res.sort(key=lambda s: s['name'])

        return res


class RunIndex(Index['Run']):
    pass


def get(run_uuid: str, labml_token: str = '') -> Optional[Run]:
    project = user.get_project(labml_token)

    if run_uuid in project.runs:
        return project.runs[run_uuid].load()
    else:
        return None


def get_or_create(run_uuid: str, labml_token: str = '', run_ip: str = '') -> Run:
    project = user.get_project(labml_token)

    if run_uuid in project.runs:
        return project.runs[run_uuid].load()

    time_now = time.time()

    series = SeriesCollection(types={ind: [] for ind in INDICATORS})
    status = create_status()
    run_preferences = RunPreferences()
    run = Run(run_uuid=run_uuid,
              start_time=time_now,
              run_ip=run_ip,
              series=series.key,
              status=status.key,
              run_preferences=run_preferences.key
              )
    project.runs[run.run_uuid] = run.key

    run.save()
    run_preferences.save()
    project.save()
    series.save()

    RunIndex.set(run.run_uuid, run.key)

    return run


def get_runs(labml_token: str) -> List[Run]:
    res = []
    project = user.get_project(labml_token)
    for run_uuid, run_key in project.runs.items():
        res.append(run_key.load())

    return res


def get_run(run_uuid: str) -> Optional[Run]:
    run_key = RunIndex.get(run_uuid)

    if run_key:
        return run_key.load()

    return None
