from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index

from .analysis import Analysis
from .series import SeriesModel
from ..enums import SeriesEnums
from .series_collection import SeriesCollection


@Analysis.db_model
class TimeTrackingModel(Model['TimeTrackingModel'], SeriesCollection):
    path = 'TimeTracking'


@Analysis.db_index
class TimeTrackingIndex(Index['TimeTracking']):
    path = 'TimeTrackingIndex.yaml'


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

            return TimeTrackingAnalysis(t)

        return TimeTrackingAnalysis(time_key.load())


@Analysis.route('POST', 'times_track/<run_uuid>')
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
