from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection


@Analysis.db_model(PickleSerializer, 'Disk')
class DiskModel(Model['DiskModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'disk_index.yaml')
class DiskIndex(Index['Disk']):
    pass


class DiskAnalysis(Analysis):
    disk: DiskModel

    def __init__(self, data):
        self.disk = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == COMPUTEREnums.DISK:
                res[ind] = s

        self.disk.track(res)

    def get_tracking(self):
        res = self.disk.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(computer_uuid: str):
        disk_key = DiskIndex.get(computer_uuid)

        if not disk_key:
            d = DiskModel()
            d.save()
            DiskIndex.set(computer_uuid, d.key)

            return DiskAnalysis(d)

        return DiskAnalysis(disk_key.load())


@Analysis.route('GET', 'disk/<computer_uuid>')
def get_disk_tracking(computer_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = DiskAnalysis.get_or_create(computer_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
