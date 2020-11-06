from typing import Dict

from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


class Parameters(Model['Parameters'], SeriesCollection):
    type = SeriesEnums.PARAM


class ParametersIndex(Index['Parameters']):
    pass


class ParametersAnalysis(Analysis):
    parameters: Parameters

    def __init__(self, data):
        self.parameters = data

    def track(self, data: Dict[str, SeriesModel]):
        self.parameters.track(data)

    def get_tracking(self):
        res = self.parameters.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        parameters_key = ParametersIndex.get(run_uuid)

        if not parameters_key:
            p = Parameters()
            p.save()
            ParametersIndex.set(run_uuid, p.key)

            return ParametersAnalysis(p)

        return ParametersAnalysis(parameters_key.load())
