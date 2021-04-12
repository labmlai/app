from typing import Dict, List, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from labml_app import utils
from labml_app.logger import logger
from labml_app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..series_collection import SeriesCollection
from ..preferences import Preferences

SERIES_NAMES = ['rss', 'vms', 'cpu', 'threads', 'user', 'system']
STATIC_NAMEs = ['name', 'create_time', 'pid', 'ppid', 'dead', 'exe', 'cmdline']


@Analysis.db_model(PickleSerializer, 'Process')
class ProcessModel(Model['ProcessModel'], SeriesCollection):
    names: Dict[str, str]
    exes: Dict[str, str]
    cmdlines: Dict[str, str]
    create_times: Dict[str, float]
    pids: Dict[str, float]
    ppids: Dict[str, float]
    dead: Dict[str, bool]
    gpu_processes: Dict[str, List[str]]

    @classmethod
    def defaults(cls):
        return dict(
            names={},
            exes={},
            cmdlines={},
            create_times={},
            pids={},
            ppids={},
            dead={},
            gpu_processes={}
        )


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
        self.process.max_buffer_length = 100

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_split = ind.split('.')
            ind_type = ind_split[0]
            if ind_type == COMPUTEREnums.PROCESS:
                suffix = ind_split[-1]
                process_id = '.'.join(ind_split[:-1])

                if 'name' == suffix:
                    if process_id not in self.process.names:
                        self.process.names[process_id] = s['value'][0]
                    continue
                elif 'exe' == suffix:
                    if process_id not in self.process.exes:
                        self.process.exes[process_id] = s['value'][0]
                    continue
                elif 'cmdline' == suffix:
                    if process_id not in self.process.cmdlines:
                        self.process.cmdlines[process_id] = s['value'][0]
                    continue
                elif 'create_time' == suffix:
                    if process_id not in self.process.create_times:
                        self.process.create_times[process_id] = s['value'][0]
                    continue
                elif 'pid' == suffix:
                    if process_id not in self.process.pids:
                        self.process.pids[process_id] = s['value'][0]
                    continue
                elif 'ppids' == suffix:
                    if process_id not in self.process.ppids:
                        self.process.ppids[process_id] = s['value'][0]
                    continue
                elif 'dead' == suffix:
                    if process_id not in self.process.dead:
                        self.process.dead[process_id] = s['value'][0]
                    continue

                if 'gpu' in process_id:
                    process_id = '.'.join(ind_split[:2])
                    gpu_process = '.'.join(ind_split[2:4])

                    if process_id in self.process.gpu_processes:
                        self.process.gpu_processes[process_id].append(gpu_process)
                    else:
                        self.process.gpu_processes[process_id] = [gpu_process]

                res[ind] = s

        self.process.track(res)

    def get_tracking(self):
        res = {}
        for ind, track in self.process.tracking.items():
            ind_split = ind.split('.')
            process_id = '.'.join(ind_split[:-1])

            dead = self.process.dead.get(process_id, 0)
            if dead:
                continue

            if process_id not in res:
                res[process_id] = {'process_id': process_id,
                                   'dead': dead,
                                   'pid': self.process.pids.get(process_id, 0),
                                   'name': self.process.names.get(process_id, ''),
                                   }

            suffix = ind_split[-1]
            if suffix in ['cpu', 'rss']:
                series: Dict[str, Any] = Series().load(track).detail
                res[process_id][suffix] = series

        ret = []
        for k, v in res.items():
            if 'cpu' not in v or 'rss' not in v:
                continue

            ret.append(v)

        ret.sort(key=lambda s: s['cpu']['smoothed'][-1], reverse=True)

        summary = []
        for v in ret[:5]:
            v['cpu']['name'] = v['name']
            summary.append(v['cpu'])

        return ret, summary

    def get_process(self, process_id: str):
        res = {'process_id': process_id,
               'name': self.process.names[process_id],
               'create_time': self.process.create_times.get(process_id, 0),
               'cmdline': self.process.cmdlines.get(process_id, ''),
               'exe': self.process.exes.get(process_id, ''),
               'pid': self.process.pids.get(process_id, 0),
               'ppid': self.process.ppids.get(process_id, 0),
               'dead': self.process.dead.get(process_id, 0),
               }

        series_list = []
        for s_name in SERIES_NAMES:
            ind = process_id + f'.{s_name}'

            track = self.process.tracking.get(ind, {})
            if track:
                series: Dict[str, Any] = Series().load(track).detail
                series['name'] = s_name
                series_list.append(series)

        gpu_processes = self.process.gpu_processes.get(process_id, [])
        for gpu_process in gpu_processes:
            s_name = f'.{gpu_process}.mem'
            ind = process_id + s_name

            track = self.process.tracking.get(ind, {})
            if track:
                series: Dict[str, Any] = Series().load(track).detail
                series['name'] = s_name
                series_list.append(series)

        res['series'] = series_list

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
    def delete(session_uuid: str):
        process_key = ProcessIndex.get(session_uuid)
        preferences_key = ProcessPreferencesIndex.get(session_uuid)

        if process_key:
            p: ProcessModel = process_key.load()
            ProcessIndex.delete(session_uuid)
            p.delete()

        if preferences_key:
            pp: ProcessPreferencesModel = preferences_key.load()
            ProcessPreferencesIndex.delete(session_uuid)
            pp.delete()


@Analysis.route('GET', 'process/<session_uuid>')
def get_process_tracking(session_uuid: str) -> Any:
    track_data = []
    summary_data = []
    status_code = 404

    ans = ProcessAnalysis.get_or_create(session_uuid)
    if ans:
        track_data, summary_data = ans.get_tracking()
        status_code = 200

    response = make_response(utils.format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/<session_uuid>/details/<process_id>')
def get_process_detail(session_uuid: str, process_id: str) -> Any:
    data = {}
    status_code = 404

    ans = ProcessAnalysis.get_or_create(session_uuid)
    if ans:
        data = ans.get_process(process_id)
        status_code = 200

    response = make_response(utils.format_rv(data))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/preferences/<session_uuid>')
def get_process_preferences(session_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ProcessPreferencesIndex.get(session_uuid)
    if not preferences_key:
        return utils.format_rv(preferences_data)

    pp: ProcessPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(utils.format_rv(preferences_data))

    return response


@Analysis.route('POST', 'process/preferences/<session_uuid>')
def set_process_preferences(session_uuid: str) -> Any:
    preferences_key = ProcessPreferencesIndex.get(session_uuid)

    if not preferences_key:
        return utils.format_rv({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update process preferences: {pp.key}')

    return utils.format_rv({'errors': pp.errors})
