from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index

from .analysis import Analysis, route
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


@route('POST', 'params_track/<run_uuid>')
def get_params_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = ParametersAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
