from typing import Any, Dict

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.logger import logger
from labml_app import utils
from ..analysis import Analysis
from .. import preferences


class ComparisonPreferences(preferences.Preferences):
    base_series_preferences: preferences.SeriesPreferences
    base_experiment: str

    @classmethod
    def defaults(cls):
        return dict(base_series_preferences=[],
                    base_experiment=str,
                    )

    def update_preferences(self, data: preferences.PreferencesData) -> None:
        if 'base_series_preferences' in data:
            self.update_base_series_preferences(data['base_series_preferences'])

        if 'base_experiment' in data:
            self.base_experiment = data['base_experiment']

        self.save()

    def update_base_series_preferences(self, data: preferences.SeriesPreferences) -> None:
        self.base_series_preferences = data

    def get_data(self) -> Dict[str, Any]:
        return {
            'base_series_preferences': self.base_series_preferences,
            'base_experiment': self.base_experiment,
            'chart_type': self.chart_type,
        }


@Analysis.db_model(PickleSerializer, 'comparison_preferences')
class ComparisonPreferencesModel(Model['ComparisonPreferencesModel'], ComparisonPreferences):
    pass


@Analysis.db_index(YamlSerializer, 'comparison_preferences_index.yaml')
class ComparisonPreferencesIndex(Index['ComparisonPreferences']):
    pass


@Analysis.route('GET', 'compare/preferences/<run_uuid>')
def get_comparison_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ComparisonPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return utils.format_rv(preferences_data)

    cp: ComparisonPreferencesModel = preferences_key.load()
    preferences_data = cp.get_data()

    response = make_response(utils.format_rv(preferences_data))

    return response


@Analysis.route('POST', 'compare/preferences/<run_uuid>')
def set_comparison_preferences(run_uuid: str) -> Any:
    preferences_key = ComparisonPreferencesIndex.get(run_uuid)

    if not preferences_key:
        cp = ComparisonPreferencesModel()
        ComparisonPreferencesIndex.set(run_uuid, cp.key)
    else:
        cp = preferences_key.load()

    cp.update_preferences(request.json)

    logger.debug(f'update comparison preferences: {cp.key}')

    return utils.format_rv({'errors': cp.errors})
