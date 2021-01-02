from typing import Dict, Any

from flask import jsonify, make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.utils import format_rv
from app.logging import logger
from app.enums import COMPUTEREnums
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
    def get_or_create(computer_uuid: str):
        cpu_key = ProcessIndex.get(computer_uuid)

        if not cpu_key:
            p = ProcessModel()
            p.save()
            ProcessIndex.set(computer_uuid, p.key)

            pp = ProcessPreferencesModel()
            pp.save()
            ProcessPreferencesIndex.set(computer_uuid, pp.key)

            return ProcessAnalysis(p)

        return ProcessAnalysis(cpu_key.load())


@Analysis.route('GET', 'process/<computer_uuid>')
def get_process_tracking(computer_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = ProcessAnalysis.get_or_create(computer_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/preferences/<computer_uuid>')
def get_process_preferences(computer_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ProcessPreferencesIndex.get(computer_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    pp: ProcessPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'process/preferences/<computer_uuid>')
def set_process_preferences(computer_uuid: str) -> Any:
    preferences_key = ProcessPreferencesIndex.get(computer_uuid)


    if not preferences_key:
        return format_rv({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update process preferences: {pp.key}')

    return format_rv({'errors': pp.errors})
