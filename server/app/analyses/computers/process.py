from typing import Dict, Any

from flask import jsonify, make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.logging import logger
from app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'Process')
class ProcessModel(Model['ProcessModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'process_index.yaml')
class ProcessIndex(Index['Process']):
    pass


@Analysis.db_model(PickleSerializer, 'process_preferences')
class ProcessPreferencesModel(Model['ProcessPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'process_preferences_index.yaml')
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
        res = self.process.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(computer_uuid: str):
        cpu_key = ProcessIndex.get(computer_uuid)

        if not cpu_key:
            c = ProcessModel()
            c.save()
            ProcessIndex.set(computer_uuid, c.key)

            return ProcessAnalysis(c)

        return ProcessAnalysis(cpu_key.load())


@Analysis.route('GET', 'process/<computer_uuid>')
def get_process_tracking(computer_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = ProcessAnalysis.get_or_create(computer_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/preferences/<computer_uuid>')
def get_process_preferences(computer_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ProcessPreferencesIndex.get(computer_uuid)
    if not preferences_key:
        logger.error(f'no process preferences found computer_uuid : {computer_uuid}')
        return jsonify(preferences_data)

    pp: ProcessPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(jsonify(preferences_data))

    return response


@Analysis.route('POST', 'process/preferences/<computer_uuid>')
def set_process_preferences(computer_uuid: str) -> Any:
    preferences_key = ProcessPreferencesIndex.get(computer_uuid)

    if not preferences_key:
        return jsonify({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update process preferences: {pp.key}')

    return jsonify({'errors': pp.errors})
