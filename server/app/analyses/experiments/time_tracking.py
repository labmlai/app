from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.logging import logger
from app.enums import SeriesEnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences
from app.utils import format_rv
from app.utils import mix_panel


@Analysis.db_model(PickleSerializer, 'time_tracking')
class TimeTrackingModel(Model['TimeTrackingModel'], SeriesCollection):
    pass


@Analysis.db_model(PickleSerializer, 'times_preferences')
class TimesPreferencesModel(Model['TimesPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'times_preferences_index.yaml')
class TimesPreferencesIndex(Index['TimesPreferences']):
    pass


@Analysis.db_index(YamlSerializer, 'time_tracking_index.yaml')
class TimeTrackingIndex(Index['TimeTracking']):
    pass


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


@mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'times/<run_uuid>')
def get_times_tracking(run_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = TimeTrackingAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv(track_data))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'times/preferences/<run_uuid>')
def get_times_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = TimesPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    tp: TimesPreferencesModel = preferences_key.load()
    preferences_data = tp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'times/preferences/<run_uuid>')
def set_times_preferences(run_uuid: str) -> Any:
    preferences_key = TimesPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return format_rv({})

    tp = preferences_key.load()
    tp.update_preferences(request.json)

    logger.debug(f'update times references: {tp.key}')

    return format_rv({'errors': tp.errors})
