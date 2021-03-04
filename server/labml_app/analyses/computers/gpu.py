from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from labml_app.utils import format_rv
from labml_app.logger import logger
from labml_app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..preferences import Preferences
from ..series_collection import SeriesCollection
from ..utils import get_mean_series


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
        inds = {}
        for ind, track in self.gpu.tracking.items():
            print(ind)
            name = ind.split('.')

            if [i for i in name if i in ['total', 'limit']]:
                continue

            series: Dict[str, Any] = Series().load(track).detail
            series['name'] = '.'.join(name[1:])

            if name[1] in inds:
                inds[name[1]].append(series)
            else:
                inds[name[1]] = []

        for k, v in inds.items():
            res.extend(v)
            if v:
                mean_series = get_mean_series(v)
                mean_series['name'] = f'{k}.mean'
                res.append(mean_series)

        return res

    @staticmethod
    def get_or_create(session_uuid: str):
        gpu_key = GPUIndex.get(session_uuid)

        if not gpu_key:
            g = GPUModel()
            g.save()
            GPUIndex.set(session_uuid, g.key)

            gp = GPUPreferencesModel()
            gp.save()
            GPUPreferencesIndex.set(session_uuid, gp.key)

            return GPUAnalysis(g)

        return GPUAnalysis(gpu_key.load())

    @staticmethod
    def delete(run_uuid: str):
        gpu_key = GPUIndex.get(run_uuid)
        preferences_key = GPUPreferencesIndex.get(run_uuid)

        if gpu_key:
            g: GPUModel = gpu_key.load()
            GPUIndex.delete(run_uuid)
            g.delete()

        if preferences_key:
            gp: GPUPreferencesModel = preferences_key.load()
            GPUPreferencesIndex.delete(run_uuid)
            gp.delete()


@Analysis.route('GET', 'gpu/<session_uuid>')
def get_gpu_tracking(session_uuid: str) -> Any:
    track_data = []
    status_code = 400

    ans = GPUAnalysis.get_or_create(session_uuid)
    if ans:
        track_data = ans.get_tracking()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': []}))
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
    gp.update_sub_series_preferences(request.json)

    logger.debug(f'update gpu preferences: {gp.key}')

    return format_rv({'errors': gp.errors})
