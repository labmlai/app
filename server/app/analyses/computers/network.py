from typing import Dict, Any

from flask import jsonify, make_response
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection


@Analysis.db_model(PickleSerializer, 'Network')
class NetworkModel(Model['NetworkModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'network_index.yaml')
class NetworkIndex(Index['Network']):
    pass


class NetworkAnalysis(Analysis):
    network: NetworkModel

    def __init__(self, data):
        self.network = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == COMPUTEREnums.NETWORK:
                res[ind] = s

        self.network.track(res)

    def get_tracking(self):
        res = self.network.get_tracks()

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(computer_uuid: str):
        cpu_key = NetworkIndex.get(computer_uuid)

        if not cpu_key:
            c = NetworkModel()
            c.save()
            NetworkIndex.set(computer_uuid, c.key)

            return NetworkAnalysis(c)

        return NetworkAnalysis(cpu_key.load())


@Analysis.route('GET', 'network/<computer_uuid>')
def get_network_tracking(computer_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = NetworkAnalysis.get_or_create(computer_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(jsonify(track_data))
    response.status_code = status_code

    return response
