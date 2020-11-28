from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection


@Analysis.db_model(PickleSerializer, 'Memory')
class MemoryModel(Model['MemoryModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'memory_index.yaml')
class MemoryIndex(Index['Memory']):
    pass


class MemoryAnalysis(Analysis):
    memory: MemoryModel

    def __init__(self, data):
        self.memory = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == COMPUTEREnums.MEMORY:
                res[ind] = s

        self.memory.track(res)

    def get_tracking(self):
        res = self.memory.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(computer_uuid: str):
        cpu_key = MemoryIndex.get(computer_uuid)

        if not cpu_key:
            c = MemoryModel()
            c.save()
            MemoryIndex.set(computer_uuid, c.key)

            return MemoryAnalysis(c)

        return MemoryAnalysis(cpu_key.load())


@Analysis.route('GET', 'memory/<computer_uuid>')
def get_memory_tracking(computer_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = MemoryAnalysis.get_or_create(computer_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
