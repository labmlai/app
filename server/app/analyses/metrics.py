from typing import Dict

from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


class Metrics(Model['Metrics'], SeriesCollection):
    type = SeriesEnums.METRIC


class MetricsIndex(Index['Metrics']):
    pass


class MetricsAnalysis(Analysis):
    metrics: Metrics

    def __init__(self, data):
        self.metrics = data

    def track(self, data: Dict[str, SeriesModel]):
        self.metrics.track(data)

    def get_tracking(self):
        res = self.metrics.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        metrics_key = MetricsIndex.get(run_uuid)

        if not metrics_key:
            m = Metrics()
            m.save()
            MetricsIndex.set(run_uuid, m.key)

            return MetricsAnalysis(m)

        return MetricsAnalysis(metrics_key.load())
