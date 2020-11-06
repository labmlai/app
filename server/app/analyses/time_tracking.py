from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index

from .analysis import Analysis, route
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


class TimeTracking(Model['TimeTracking'], SeriesCollection):
    type = SeriesEnums.TIME


class TimeTrackingIndex(Index['TimeTracking']):
    pass


class TimeTrackingAnalysis(Analysis):
    time_tracking: TimeTracking

    def __init__(self, data):
        self.time_tracking = data

    def track(self, data: Dict[str, SeriesModel]):
        self.time_tracking.track(data)

    def get_tracking(self):
        res = self.time_tracking.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        time_key = TimeTrackingIndex.get(run_uuid)

        if not time_key:
            t = TimeTracking()
            t.save()
            TimeTrackingIndex.set(run_uuid, t.key)

            return TimeTrackingAnalysis(t)

        return TimeTrackingAnalysis(time_key.load())


@route('POST', 'times_track/<run_uuid>')
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
