from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.utils import format_rv
from labml_app.utils import mix_panel
from labml_app.logger import logger
from labml_app.enums import SeriesEnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences
from .. import utils


@Analysis.db_model(PickleSerializer, 'parameters')
class ParametersModel(Model['ParametersModel'], SeriesCollection):
    pass


@Analysis.db_model(PickleSerializer, 'parameters_preferences')
class ParametersPreferencesModel(Model['ParametersPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'parameters_preferences_index.yaml')
class ParametersPreferencesIndex(Index['ParametersPreferences']):
    pass


@Analysis.db_index(YamlSerializer, 'parameters_index.yaml')
class ParametersIndex(Index['Parameters']):
    pass


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

    def get_track_summaries(self):
        res = self.parameters.get_track_summaries()

        return res

    def get_tracking(self):
        res = self.parameters.get_tracks()

        res.sort(key=lambda s: s['mean'], reverse=True)

        utils.remove_common_prefix(res, 'name')

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

    @staticmethod
    def delete(run_uuid: str):
        parameters_key = ParametersIndex.get(run_uuid)
        preferences_key = ParametersPreferencesIndex.get(run_uuid)

        if parameters_key:
            p: ParametersModel = parameters_key.load()
            ParametersIndex.delete(run_uuid)
            p.delete()

        if preferences_key:
            pp: ParametersPreferencesModel = preferences_key.load()
            ParametersPreferencesIndex.delete(run_uuid)
            pp.delete()


@mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'parameters/<run_uuid>')
def get_params_tracking(run_uuid: str) -> Any:
    track_data = []
    summary_data = []
    status_code = 400

    ans = ParametersAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        summary_data = ans.get_track_summaries()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'parameters/preferences/<run_uuid>')
def get_params_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ParametersPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    pp: ParametersPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'parameters/preferences/<run_uuid>')
def set_params_preferences(run_uuid: str) -> Any:
    preferences_key = ParametersPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return format_rv({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update parameters preferences: {pp.key}')

    return format_rv({'errors': pp.errors})
