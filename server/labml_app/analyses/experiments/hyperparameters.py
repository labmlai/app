from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from labml_app.logger import logger
from labml_app.enums import SeriesEnums
from labml_app import utils
from labml_app import auth
from ..series import Series
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'hyperparams')
class HyperParamsModel(Model['HyperParamsModel'], SeriesCollection):
    default_values: Dict[str, any]
    hp_values: Dict[str, any]
    hp_series: Dict[str, SeriesModel]
    has_hp_updated: Dict[str, bool]

    @classmethod
    def defaults(cls):
        return dict(
            default_values={},
            hp_values={},
            hp_series={},
            has_hp_updated={},
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
        default_values = self.hyper_params.default_values
        for ind, track in self.hyper_params.tracking.items():
            name = ind.split('.')
            name = ''.join(name[-1])

            s = Series().load(track)
            series: Dict[str, Any] = {'step': s.last_step,
                                      'value': s.value,
                                      'smoothed': s.value,
                                      'is_editable': name in default_values,
                                      'range': default_values[name]['range'],
                                      'dynamic_type': default_values[name]['dynamic_type'],
                                      'name': name}

            if name in self.hyper_params.hp_series:
                s = Series().load(self.hyper_params.hp_series[name])
                steps, values = self.get_input_series(s, self.hyper_params.step, default_values[name]['default'])

                series['sub'] = {'step': steps, 'value': values, 'smoothed': values}

            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_input_series(series: Series, current_step, default: float):
        steps, values = [0, series.step[0] - 1], [default, default]

        for i in range(len(series.step)):
            v = series.value[i]

            if i + 1 > len(series.step) - 1:
                ns = current_step - 1
            else:
                ns = series.step[i + 1] - 1

            steps += [series.step[i], ns]
            values += [v, v]

        if values:
            steps.append(current_step)
            values.append(values[-1])

        return steps, values

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
        hp_values = self.hyper_params.hp_values
        for k, v in data.items():
            if k not in hp_values:
                continue

            try:
                new_value = float(v)
                current_value = hp_values[k]

                if current_value and current_value == new_value:
                    continue

                hp_values[k] = new_value
                self.update_hp_series(k, new_value)
                self.hyper_params.has_hp_updated[k] = True
            except ValueError:
                logger.error(f'not a number : {v}')

        self.hyper_params.save()

    def update_hp_series(self, ind: str, value: float) -> None:
        hp_series = self.hyper_params.hp_series
        if ind not in hp_series:
            hp_series[ind] = Series().to_data()

        s = Series().load(hp_series[ind])

        s.step.append(self.hyper_params.step)
        s.value.append(value)

        hp_series[ind] = s.to_data()

    def set_default_values(self, data: Dict[str, any]):
        default_values = {}
        hp_values = {}
        for k, v in data.items():
            default_values[k] = v
            hp_values[k] = v['default']

        self.hyper_params.default_values = default_values
        self.hyper_params.hp_values = hp_values
        self.hyper_params.save()

    def get_hyper_params(self):
        res = {}
        is_saving = False
        has_hp_updated = self.hyper_params.has_hp_updated
        for k, v in self.hyper_params.hp_values.items():
            if has_hp_updated.get(k, False):
                res[k] = v
                is_saving = True
                has_hp_updated[k] = False

        if is_saving:
            self.hyper_params.save()

        return res


@utils.mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'hyper_params/<run_uuid>')
def get_hyper_params_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 404

    ans = HyperParamsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(utils.format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'hyper_params/preferences/<run_uuid>')
def get_hyper_params_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = HyperParamsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return utils.format_rv(preferences_data)

    hpp: HyperParamsPreferencesModel = preferences_key.load()
    preferences_data = hpp.get_data()

    response = make_response(utils.format_rv(preferences_data))

    return response


@Analysis.route('POST', 'hyper_params/preferences/<run_uuid>')
def set_hyper_params_preferences(run_uuid: str) -> Any:
    preferences_key = HyperParamsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return utils.format_rv({})

    hpp = preferences_key.load()
    hpp.update_preferences(request.json)

    logger.debug(f'update hyper_params preferences: {hpp.key}')

    return utils.format_rv({'errors': hpp.errors})


@Analysis.route('POST', 'hyper_params/<run_uuid>', True)
def set_hyper_params(run_uuid: str) -> Any:
    status_code = 404

    p = auth.get_auth_user().default_project
    if not p.is_project_run(run_uuid):
        status_code = 403
        response = make_response(utils.format_rv({'errors': []}))
        response.status_code = status_code

        return response

    ans = HyperParamsAnalysis.get_or_create(run_uuid)
    if ans:
        ans.set_hyper_params(request.json)
        status_code = 200

    response = make_response(utils.format_rv({'errors': []}))
    response.status_code = status_code

    return response
