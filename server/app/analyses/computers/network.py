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


@Analysis.db_model(PickleSerializer, 'Network')
class NetworkModel(Model['NetworkModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'network_index.yaml')
class NetworkIndex(Index['Network']):
    pass


@Analysis.db_model(PickleSerializer, 'network_preferences')
class NetworkPreferencesModel(Model['NetworkPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'network_preferences_index.yaml')
class NetworkPreferencesIndex(Index['NetworkPreferences']):
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
        res = []
        for ind, track in self.network.tracking.items():
            name = ind.split('.')
            series: Dict[str, Any] = Series().load(track).detail
            series['name'] = '.'.join(name)

            res.append(series)

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

    response = make_response(format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'network/preferences/<computer_uuid>')
def get_network_preferences(computer_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = NetworkPreferencesIndex.get(computer_uuid)
    if not preferences_key:
        return jsonify(preferences_data)

    np: NetworkPreferencesModel = preferences_key.load()
    preferences_data = np.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'network/preferences/<computer_uuid>')
def set_network_preferences(computer_uuid: str) -> Any:
    preferences_key = NetworkPreferencesIndex.get(computer_uuid)

    if not preferences_key:
        return jsonify({})

    np = preferences_key.load()
    np.update_preferences(request.json)

    logger.debug(f'update network preferences: {np.key}')

    return format_rv({'errors': np.errors})
