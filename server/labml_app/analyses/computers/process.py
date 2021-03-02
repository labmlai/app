from typing import Dict, Any

from flask import jsonify, make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.utils import format_rv
from labml_app.logger import logger
from labml_app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'Process')
class ProcessModel(Model['ProcessModel'], SeriesCollection):
    pass


@Analysis.db_index(PickleSerializer, 'process_index')
class ProcessIndex(Index['Process']):
    pass


@Analysis.db_model(PickleSerializer, 'process_preferences')
class ProcessPreferencesModel(Model['ProcessPreferencesModel'], Preferences):
    pass


@Analysis.db_index(PickleSerializer, 'process_preferences_index')
class ProcessPreferencesIndex(Index['ProcessPreferences']):
    pass


class ProcessAnalysis(Analysis):
    process: ProcessModel

    def __init__(self, data):
        self.process = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == COMPUTEREnums.PROCESS:
                res[ind] = s

        self.process.track(res)

    def get_tracking(self):
        res = []
        for ind, track in self.process.tracking.items():
            name = ind.split('.')
            series: Dict[str, Any] = Series().load(track).detail
            series['name'] = '.'.join(name)

            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(session_uuid: str):
        process_key = ProcessIndex.get(session_uuid)

        if not process_key:
            p = ProcessModel()
            p.save()
            ProcessIndex.set(session_uuid, p.key)

            pp = ProcessPreferencesModel()
            pp.save()
            ProcessPreferencesIndex.set(session_uuid, pp.key)

            return ProcessAnalysis(p)

        return ProcessAnalysis(process_key.load())

    @staticmethod
    def delete(run_uuid: str):
        process_key = ProcessIndex.get(run_uuid)
        preferences_key = ProcessPreferencesIndex.get(run_uuid)

        if process_key:
            p: ProcessModel = process_key.load()
            ProcessIndex.delete(run_uuid)
            p.delete()

        if preferences_key:
            pp: ProcessPreferencesModel = preferences_key.load()
            ProcessPreferencesIndex.delete(run_uuid)
            pp.delete()


@Analysis.route('GET', 'process/<session_uuid>')
def get_process_tracking(session_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = ProcessAnalysis.get_or_create(session_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/preferences/<session_uuid>')
def get_process_preferences(session_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ProcessPreferencesIndex.get(session_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    pp: ProcessPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'process/preferences/<session_uuid>')
def set_process_preferences(session_uuid: str) -> Any:
    preferences_key = ProcessPreferencesIndex.get(session_uuid)

    if not preferences_key:
        return format_rv({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update process preferences: {pp.key}')

    return format_rv({'errors': pp.errors})
