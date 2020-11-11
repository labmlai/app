from typing import Dict, Any

from flask import jsonify, make_response, request
from labml_db import Model, Index

from ..logging import logger
from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection
from .preferences import Preferences


@Analysis.db_model
class GradientsModel(Model['GradientsModel'], SeriesCollection):
    path = 'gradients'


@Analysis.db_model
class GradientsPreferencesModel(Model['GradientsPreferencesModel'], Preferences):
    path = 'gradients_preferences'


@Analysis.db_index
class GradientsPreferencesIndex(Index['GradientsPreferences']):
    path = 'gradients_preferences_index.yaml'


@Analysis.db_index
class GradientsIndex(Index['Gradients']):
    path = 'gradients_index.yaml'


class GradientsAnalysis(Analysis):
    gradients: GradientsModel

    def __init__(self, data):
        self.gradients = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == SeriesEnums.GRAD:
                res[ind] = s

        self.gradients.track(res)

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

            gp = GradientsPreferencesModel()
            gp.save()
            GradientsPreferencesIndex.set(run_uuid, gp.key)

            return GradientsAnalysis(g)

        return GradientsAnalysis(gradients_key.load())


@Analysis.route('GET', 'gradients/<run_uuid>')
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


@Analysis.route('GET', 'gradients/preferences/<run_uuid>')
def get_grads_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = GradientsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        logger.error(f'no gradients preferences found run_uuid : {run_uuid}')
        return jsonify(preferences_data)

    gp: GradientsPreferencesModel = preferences_key.load()
    preferences_data = gp.get_data()

    response = make_response(jsonify(preferences_data))

    return response


@Analysis.route('POST', 'gradients/preferences/<run_uuid>')
def set_grads_preferences(run_uuid: str) -> Any:
    preferences_key = GradientsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return jsonify({})

    gp = preferences_key.load()
    gp.update_preferences(request.json)

    logger.debug(f'update gradients references: {gp.key}')

    return jsonify({'errors': gp.errors})
