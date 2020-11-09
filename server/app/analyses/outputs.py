from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


@Analysis.db_model
class OutputsModel(Model['OutputsModel'], SeriesCollection):
    path = 'Outputs'


@Analysis.db_index
class OutputsIndex(Index['Outputs']):
    path = 'OutputsIndex.yaml'


class OutputsAnalysis(Analysis):
    outputs: OutputsModel

    def __init__(self, data):
        self.outputs = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == SeriesEnums.MODULE:
                res[ind] = s

        self.outputs.track(res)

    def get_tracking(self):
        res = self.outputs.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        outputs_key = OutputsIndex.get(run_uuid)

        if not outputs_key:
            o = OutputsModel()
            o.save()
            OutputsIndex.set(run_uuid, o.key)

            return OutputsAnalysis(o)

        return OutputsAnalysis(outputs_key.load())


@Analysis.route('POST', 'outputs_track/<run_uuid>')
def get_modules_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = OutputsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
