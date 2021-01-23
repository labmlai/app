from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from app.utils import format_rv
from app.logging import logger
from app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'GPU')
class GPUModel(Model['GPUModel'], SeriesCollection):
    pass


@Analysis.db_index(PickleSerializer, 'gpu_index')
class GPUIndex(Index['GPU']):
    pass


@Analysis.db_model(PickleSerializer, 'gpu_preferences')
class GPUPreferencesModel(Model['GPUPreferencesModel'], Preferences):
    pass


@Analysis.db_index(PickleSerializer, 'gpu_preferences_index')
class GPUPreferencesIndex(Index['GPUPreferences']):
    pass


class GPUAnalysis(Analysis):
    gpu: GPUModel

    def __init__(self, data):
        self.gpu = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_type = ind.split('.')[0]
            if ind_type == COMPUTEREnums.GPU:
                res[ind] = s

        self.gpu.track(res)

    def get_tracking(self):
        res = []
        for ind, track in self.gpu.tracking.items():
            name = ind.split('.')
            series: Dict[str, Any] = Series().load(track).detail
            series['name'] = '.'.join(name)

            res.append(series)

        res.sort(key=lambda s: s['name'])

        return res

    @staticmethod
    def get_or_create(session_uuid: str):
        gpu_key = GPUIndex.get(session_uuid)

        if not gpu_key:
            c = GPUModel()
            c.save()
            GPUIndex.set(session_uuid, c.key)

            cp = GPUPreferencesModel()
            cp.save()
            GPUPreferencesIndex.set(session_uuid, cp.key)

            return GPUAnalysis(c)

        return GPUAnalysis(gpu_key.load())


@Analysis.route('GET', 'gpu/<session_uuid>')
def get_gpu_tracking(session_uuid: str) -> Any:
    track_data = []
    summary_data = []
    status_code = 400

    ans = GPUAnalysis.get_or_create(session_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'gpu/preferences/<session_uuid>')
def get_gpu_preferences(session_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = GPUPreferencesIndex.get(session_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    gp: GPUPreferencesModel = preferences_key.load()
    preferences_data = gp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'gpu/preferences/<session_uuid>')
def set_gpu_preferences(session_uuid: str) -> Any:
    preferences_key = GPUPreferencesIndex.get(session_uuid)

    if not preferences_key:
        return format_rv({})

    gp = preferences_key.load()
    gp.update_preferences(request.json)

    logger.debug(f'update gpu preferences: {gp.key}')

    return format_rv({'errors': gp.errors})
