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
from .. import utils


@Analysis.db_model(PickleSerializer, 'Network')
class NetworkModel(Model['NetworkModel'], SeriesCollection):
    pass


@Analysis.db_index(YamlSerializer, 'network_index')
class NetworkIndex(Index['Network']):
    pass


@Analysis.db_model(PickleSerializer, 'network_preferences')
class NetworkPreferencesModel(Model['NetworkPreferencesModel'], Preferences):
    pass


@Analysis.db_index(PickleSerializer, 'network_preferences_index')
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

        utils.remove_common_prefix(res, 'name')

        return res

    @staticmethod
    def get_or_create(session_uuid: str):
        network_key = NetworkIndex.get(session_uuid)

        if not network_key:
            n = NetworkModel()
            n.save()
            NetworkIndex.set(session_uuid, n.key)

            np = NetworkPreferencesModel()
            np.save()
            NetworkPreferencesIndex.set(session_uuid, np.key)

            return NetworkAnalysis(n)

        return NetworkAnalysis(network_key.load())

    @staticmethod
    def delete(run_uuid: str):
        network_key = NetworkIndex.get(run_uuid)
        preferences_key = NetworkPreferencesIndex.get(run_uuid)

        if network_key:
            n: NetworkModel = network_key.load()
            NetworkIndex.delete(run_uuid)
            n.delete()

        if preferences_key:
            np: NetworkPreferencesModel = preferences_key.load()
            NetworkPreferencesIndex.delete(run_uuid)
            np.delete()


@Analysis.route('GET', 'network/<session_uuid>')
def get_network_tracking(session_uuid: str) -> Any:
    track_data = []
    status_code = 404

    ans = NetworkAnalysis.get_or_create(session_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': []}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'network/preferences/<session_uuid>')
def get_network_preferences(session_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = NetworkPreferencesIndex.get(session_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    np: NetworkPreferencesModel = preferences_key.load()
    preferences_data = np.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'network/preferences/<session_uuid>')
def set_network_preferences(session_uuid: str) -> Any:
    preferences_key = NetworkPreferencesIndex.get(session_uuid)

    if not preferences_key:
        return format_rv({})

    np = preferences_key.load()
    np.update_preferences(request.json)

    logger.debug(f'update network preferences: {np.key}')

    return format_rv({'errors': np.errors})
