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
class ParametersModel(Model['ParametersModel'], SeriesCollection):
    path = 'parameters'


@Analysis.db_model
class ParametersPreferencesModel(Model['ParametersPreferencesModel'], Preferences):
    path = 'parameters_preferences'


@Analysis.db_index
class ParametersPreferencesIndex(Index['ParametersPreferences']):
    path = 'parameters_preferences_index.yaml'


@Analysis.db_index
class ParametersIndex(Index['Parameters']):
    path = 'parameters_index.yaml'


class ParametersAnalysis(Analysis):
    parameters: ParametersModel

    def __init__(self, data):
        self.parameters = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == SeriesEnums.PARAM:
                res[ind] = s

        self.parameters.track(res)

    def get_tracking(self):
        res = self.parameters.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        parameters_key = ParametersIndex.get(run_uuid)

        if not parameters_key:
            p = ParametersModel()
            p.save()
            ParametersIndex.set(run_uuid, p.key)

            pp = ParametersPreferencesModel()
            pp.save()
            ParametersPreferencesIndex.set(run_uuid, pp.key)

            return ParametersAnalysis(p)

        return ParametersAnalysis(parameters_key.load())


@Analysis.route('GET', 'parameters/<run_uuid>')
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


@Analysis.route('GET', 'parameters/preferences/<run_uuid>')
def get_params_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ParametersPreferencesIndex.get(run_uuid)
    if not preferences_key:
        logger.error(f'no parameters preferences found run_uuid : {run_uuid}')
        return jsonify(preferences_data)

    pp: ParametersPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(jsonify(preferences_data))

    return response


@Analysis.route('POST', 'parameters/preferences/<run_uuid>')
def set_params_preferences(run_uuid: str) -> Any:
    preferences_key = ParametersPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return jsonify({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update parameters preferences: {pp.key}')

    return jsonify({'errors': pp.errors})
