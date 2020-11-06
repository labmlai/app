from typing import Dict

from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


class Outputs(Model['Output'], SeriesCollection):
    type = SeriesEnums.MODULE


class OutputsIndex(Index['Outputs']):
    pass


class OutputsAnalysis(Analysis):
    outputs: Outputs

    def __init__(self, data):
        self.outputs = data

    def track(self, data: Dict[str, SeriesModel]):
        self.outputs.track(data)

    def get_tracking(self):
        res = self.outputs.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        outputs_key = OutputsIndex.get(run_uuid)

        if not outputs_key:
            o = Outputs()
            o.save()
            OutputsIndex.set(run_uuid, o.key)

            return OutputsAnalysis(o)

        return OutputsAnalysis(outputs_key.load())
