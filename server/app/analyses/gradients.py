from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


@Analysis.db_model
class GradientsModel(Model['GradientsModel'], SeriesCollection):
    type = SeriesEnums.GRAD
    path = 'Gradients'


@Analysis.db_index
class GradientsIndex(Index['Gradients']):
    path = 'GradientsIndex.yaml'


class GradientsAnalysis(Analysis):
    gradients: GradientsModel

    def __init__(self, data):
        self.gradients = data

    def track(self, data: Dict[str, SeriesModel]):
        self.gradients.track(data)

    def get_tracking(self):
        res = self.gradients.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        gradients_key = GradientsIndex.get(run_uuid)

        if not gradients_key:
            g = GradientsModel()
            g.save()
            GradientsIndex.set(run_uuid, g.key)

            return GradientsAnalysis(g)

        return GradientsAnalysis(gradients_key.load())


@Analysis.route('POST', 'grads_track/<run_uuid>')
def get_grads_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = GradientsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
