from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.logger import logger
from labml_app.enums import INDICATORS
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..series_collection import SeriesCollection
from ..preferences import ComparisonPreferences
from labml_app import utils
from labml_app.settings import INDICATOR_LIMIT


@Analysis.db_model(PickleSerializer, 'comparison')
class ComparisonModel(Model['ComparisonModel'], SeriesCollection):
    pass


@Analysis.db_model(PickleSerializer, 'comparison_preferences')
class ComparisonPreferencesModel(Model['ComparisonPreferencesModel'], ComparisonPreferences):
    pass


@Analysis.db_index(YamlSerializer, 'comparison_preferences_index.yaml')
class ComparisonPreferencesIndex(Index['ComparisonPreferences']):
    pass


@Analysis.db_index(YamlSerializer, 'comparison_index.yaml')
class ComparisonIndex(Index['Comparison']):
    pass


class ComparisonAnalysis(Analysis):
    comparison: ComparisonModel

    def __init__(self, data):
        self.comparison = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_split = ind.split('.')
            ind_type = ind_split[0]
            if ind_type not in INDICATORS:
                if ind not in self.comparison.indicators:
                    if len(self.comparison.indicators) >= INDICATOR_LIMIT:
                        continue
                    self.comparison.indicators.add('.'.join(ind))

                res[ind] = s

        self.comparison.track(res)

    def get_tracking(self):
        res = []
        is_series_updated = False
        for ind, track in self.comparison.tracking.items():
            name = ind.split('.')

            s = Series().load(track)
            series: Dict[str, Any] = s.detail
            series['name'] = '.'.join(name)

            if s.is_smoothed_updated:
                self.comparison.tracking[ind] = s.to_data()
                is_series_updated = True

            res.append(series)

        if is_series_updated:
            self.comparison.save()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        comparison_key = ComparisonIndex.get(run_uuid)

        if not comparison_key:
            m = ComparisonModel()
            m.save()
            ComparisonIndex.set(run_uuid, m.key)

            mp = ComparisonPreferencesModel()
            mp.save()
            ComparisonPreferencesIndex.set(run_uuid, mp.key)

            return ComparisonAnalysis(m)

        return ComparisonAnalysis(comparison_key.load())

    @staticmethod
    def delete(run_uuid: str):
        comparison_key = ComparisonIndex.get(run_uuid)
        preferences_key = ComparisonPreferencesIndex.get(run_uuid)

        if comparison_key:
            m: ComparisonModel = comparison_key.load()
            ComparisonIndex.delete(run_uuid)
            m.delete()

        if preferences_key:
            mp: ComparisonPreferencesModel = preferences_key.load()
            ComparisonPreferencesIndex.delete(run_uuid)
            mp.delete()


@Analysis.route('GET', 'compare/preferences/<run_uuid>')
def get_comparison_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ComparisonPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return utils.format_rv(preferences_data)

    mp: ComparisonPreferencesModel = preferences_key.load()
    preferences_data = mp.get_data()

    response = make_response(utils.format_rv(preferences_data))

    return response


@Analysis.route('POST', 'compare/preferences/<run_uuid>')
def set_comparison_preferences(run_uuid: str) -> Any:
    preferences_key = ComparisonPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return utils.format_rv({})

    mp = preferences_key.load()
    mp.update_preferences(request.json)

    logger.debug(f'update comparison preferences: {mp.key}')

    return utils.format_rv({'errors': mp.errors})
