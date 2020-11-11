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
class TimeTrackingModel(Model['TimeTrackingModel'], SeriesCollection):
    path = 'time_tracking'


@Analysis.db_model
class TimesPreferencesModel(Model['TimesPreferencesModel'], Preferences):
    path = 'times_preferences'


@Analysis.db_index
class TimesPreferencesIndex(Index['TimesPreferences']):
    path = 'parameters_preferences_index.yaml'


@Analysis.db_index
class TimeTrackingIndex(Index['TimeTracking']):
    path = 'time_tracking_index.yaml'


class TimeTrackingAnalysis(Analysis):
    time_tracking: TimeTrackingModel

    def __init__(self, data):
        self.time_tracking = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == SeriesEnums.TIME:
                res[ind] = s

        self.time_tracking.track(res)

    def get_tracking(self):
        res = self.time_tracking.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        time_key = TimeTrackingIndex.get(run_uuid)

        if not time_key:
            t = TimeTrackingModel()
            t.save()
            TimeTrackingIndex.set(run_uuid, t.key)

            tp = TimesPreferencesModel()
            tp.save()
            TimesPreferencesIndex.set(run_uuid, tp.key)

            return TimeTrackingAnalysis(t)

        return TimeTrackingAnalysis(time_key.load())


@Analysis.route('GET', 'times/<run_uuid>')
def get_times_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = TimeTrackingAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'times/preferences/<run_uuid>')
def get_times_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = TimesPreferencesIndex.get(run_uuid)
    if not preferences_key:
        logger.error(f'no times preferences found run_uuid : {run_uuid}')
        return jsonify(preferences_data)

    tp: TimesPreferencesModel = preferences_key.load()
    preferences_data = tp.get_data()

    response = make_response(jsonify(preferences_data))

    return response


@Analysis.route('POST', 'times/preferences/<run_uuid>')
def set_times_preferences(run_uuid: str) -> Any:
    preferences_key = TimesPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return jsonify({})

    tp = preferences_key.load()
    tp.update_preferences(request.json)

    logger.debug(f'update times references: {tp.key}')

    return jsonify({'errors': tp.errors})
