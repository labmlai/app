from typing import Dict, Any, List

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from labml_app.logger import logger
from labml_app.enums import SeriesEnums
from labml_app.utils import format_rv
from labml_app.utils import mix_panel
from ..series import Series
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'hyperparams')
class HyperParamsModel(Model['HyperParamsModel'], SeriesCollection):
    hp_values: Dict[str, any]
    hp_steps: List[int]

    @classmethod
    def defaults(cls):
        return dict(
            hp_values={},
            hp_steps=[],
        )


@Analysis.db_model(PickleSerializer, 'hyperparams_preferences')
class HyperParamsPreferencesModel(Model['HyperParamsPreferencesModel'], Preferences):
    pass


@Analysis.db_index(PickleSerializer, 'hyperparams_preferences')
class HyperParamsPreferencesIndex(Index['HyperParamsPreferences']):
    pass


@Analysis.db_index(PickleSerializer, 'hyperparams_index')
class HyperParamsIndex(Index['HyperParams']):
    pass


class HyperParamsAnalysis(Analysis):
    hyper_params: HyperParamsModel

    def __init__(self, data):
        self.hyper_params = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == SeriesEnums.HYPERPARAMS:
                res[ind] = s

        self.hyper_params.track(res)

    def get_tracking(self):
        res = []
        for ind, track in self.hyper_params.tracking.items():
            name = ind.split('.')

            s = Series().load(track)
            series: Dict[str, Any] = s.detail
            series['name'] = ''.join(name[-1])

            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        hyper_params_key = HyperParamsIndex.get(run_uuid)

        if not hyper_params_key:
            hp = HyperParamsModel()
            hp.save()
            HyperParamsIndex.set(run_uuid, hp.key)

            hpp = HyperParamsPreferencesModel()
            hpp.save()
            HyperParamsPreferencesIndex.set(run_uuid, hpp.key)

            return HyperParamsAnalysis(hp)

        return HyperParamsAnalysis(hyper_params_key.load())

    @staticmethod
    def delete(run_uuid: str):
        hyper_params_key = HyperParamsIndex.get(run_uuid)
        preferences_key = HyperParamsPreferencesIndex.get(run_uuid)

        if hyper_params_key:
            hp: HyperParamsModel = hyper_params_key.load()
            HyperParamsIndex.delete(run_uuid)
            hp.delete()

        if preferences_key:
            gp: HyperParamsPreferencesModel = preferences_key.load()
            HyperParamsPreferencesIndex.delete(run_uuid)
            gp.delete()

    def set_hyper_params(self, data: Dict[str, any]) -> None:
        for k, v in data.items():
            try:
                value = float(v)
                self.hyper_params.hp_values[k] = value
            except ValueError:
                logger.error(f'not a number : {v}')

        self.hyper_params.hp_steps.append(self.hyper_params.step)

        self.hyper_params.save()

    def get_hyper_params(self):
        return self.hyper_params.hp_values


@mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'hyper_params/<run_uuid>')
def get_hyper_params_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 404

    ans = HyperParamsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'hyper_params/preferences/<run_uuid>')
def get_hyper_params_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = HyperParamsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    hpp: HyperParamsPreferencesModel = preferences_key.load()
    preferences_data = hpp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'hyper_params/preferences/<run_uuid>')
def set_hyper_params_preferences(run_uuid: str) -> Any:
    preferences_key = HyperParamsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return format_rv({})

    hpp = preferences_key.load()
    hpp.update_preferences(request.json)

    logger.debug(f'update hyper_params preferences: {hpp.key}')

    return format_rv({'errors': hpp.errors})


@Analysis.route('POST', 'hyper_params/<run_uuid>')
def set_hyper_params(run_uuid: str) -> Any:
    status_code = 404
    ans = HyperParamsAnalysis.get_or_create(run_uuid)

    if ans:
        ans.set_hyper_params(request.json)
        status_code = 200

    response = make_response(format_rv({'errors': []}))
    response.status_code = status_code

    return response
