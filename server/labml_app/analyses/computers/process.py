from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer

from labml_app.utils import format_rv
from labml_app.logger import logger
from labml_app.enums import COMPUTEREnums
from ..analysis import Analysis
from ..series import SeriesModel, Series
from ..series_collection import SeriesCollection
from ..preferences import Preferences


@Analysis.db_model(PickleSerializer, 'Process')
class ProcessModel(Model['ProcessModel'], SeriesCollection):
    names: Dict[str, str]
    exes: Dict[str, str]
    cmdlines: Dict[str, str]

    @classmethod
    def defaults(cls):
        return dict(
            names={},
            exes={},
            cmdlines={},
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

    def track(self, data: Dict[str, SeriesModel]):
        # name, pid, rss, vms, mem, cpu, threads
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_split = ind.split('.')
            ind_type = ind_split[0]
            suffix = ind_split[-1]
            if ind_type == COMPUTEREnums.PROCESS:
                name = '.'.join(ind_split[:-1])
                if 'name' == suffix and name not in self.process.names:
                    self.process.names[name] = s['value'][0]
                    continue

                if 'exe' == suffix and name not in self.process.exes:
                    self.process.exes[name] = s['value'][0]
                    continue

                if 'cmdline' == suffix and name not in self.process.cmdlines:
                    self.process.cmdlines[name] = s['value'][0]
                    continue

                res[ind] = s
        self.process.track(res)

    def get_tracking(self):
        res = {}
        for ind, track in self.process.tracking.items():
            ind_split = ind.split('.')
            suffix = ind_split[-1]
            name = '.'.join(ind_split[:-1])

            if name not in res:
                res[name] = {'name': self.process.names[name],
                             'cmdline': self.process.cmdlines.get(name, ''),
                             'exe': self.process.exes.get(name, ''),
                             }

            if suffix in ['cpu', 'rss']:
                series: Dict[str, Any] = Series().load(track).detail
                res[name][suffix] = series

        ret = []
        for k, v in res.items():
            if 'cpu' not in v or 'rss' not in v:
                continue
            ret.append(v)

        summary = []
        for v in ret[:5]:
            v['cpu']['name'] = v['name']
            summary.append(v['cpu'])

        return ret, summary

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
    def delete(run_uuid: str):
        process_key = ProcessIndex.get(run_uuid)
        preferences_key = ProcessPreferencesIndex.get(run_uuid)

        if process_key:
            p: ProcessModel = process_key.load()
            ProcessIndex.delete(run_uuid)
            p.delete()

        if preferences_key:
            pp: ProcessPreferencesModel = preferences_key.load()
            ProcessPreferencesIndex.delete(run_uuid)
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

    response = make_response(format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'process/preferences/<session_uuid>')
def get_process_preferences(session_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = ProcessPreferencesIndex.get(session_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    pp: ProcessPreferencesModel = preferences_key.load()
    preferences_data = pp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'process/preferences/<session_uuid>')
def set_process_preferences(session_uuid: str) -> Any:
    preferences_key = ProcessPreferencesIndex.get(session_uuid)

    if not preferences_key:
        return format_rv({})

    pp = preferences_key.load()
    pp.update_preferences(request.json)

    logger.debug(f'update process preferences: {pp.key}')

    return format_rv({'errors': pp.errors})
