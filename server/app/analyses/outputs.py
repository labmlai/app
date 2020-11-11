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
class OutputsModel(Model['OutputsModel'], SeriesCollection):
    path = 'outputs'


@Analysis.db_model
class OutputsPreferencesModel(Model['OutputsPreferencesModel'], Preferences):
    path = 'outputs_preferences'


@Analysis.db_index
class OutputsPreferencesIndex(Index['OutputsPreferences']):
    path = 'outputs_preferences_index.yaml'


@Analysis.db_index
class OutputsIndex(Index['Outputs']):
    path = 'outputs_index.yaml'


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

            op = OutputsPreferencesModel()
            op.save()
            OutputsPreferencesIndex.set(run_uuid, op.key)

            return OutputsAnalysis(o)

        return OutputsAnalysis(outputs_key.load())


@Analysis.route('GET', 'outputs/<run_uuid>')
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


@Analysis.route('GET', 'outputs/preferences/<run_uuid>')
def get_modules_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = OutputsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        logger.error(f'no outputs preferences found run_uuid : {run_uuid}')
        return jsonify(preferences_data)

    op: OutputsPreferencesModel = preferences_key.load()
    preferences_data = op.get_data()

    response = make_response(jsonify(preferences_data))

    return response


@Analysis.route('POST', 'outputs/preferences/<run_uuid>')
def set_modules_preferences(run_uuid: str) -> Any:
    preferences_key = OutputsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return jsonify({})

    op = preferences_key.load()
    op.update_preferences(request.json)

    logger.debug(f'update outputs preferences: {op.key}')

    return jsonify({'errors': op.errors})
