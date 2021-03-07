from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.utils import format_rv
from labml_app.utils import mix_panel
from labml_app.logger import logger
from labml_app.enums import SeriesEnums
from labml_app.settings import INDICATOR_LIMIT
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences
from .. import utils


@Analysis.db_model(PickleSerializer, 'outputs')
class OutputsModel(Model['OutputsModel'], SeriesCollection):
    pass


@Analysis.db_model(PickleSerializer, 'outputs_preferences')
class OutputsPreferencesModel(Model['OutputsPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'outputs_preferences_index.yaml')
class OutputsPreferencesIndex(Index['OutputsPreferences']):
    pass


@Analysis.db_index(YamlSerializer, 'outputs_index.yaml')
class OutputsIndex(Index['Outputs']):
    pass


class OutputsAnalysis(Analysis):
    outputs: OutputsModel

    def __init__(self, data):
        self.outputs = data

    def track(self, data: Dict[str, SeriesModel]):
        res = {}
        for ind, s in data.items():
            ind_split = ind.split('.')
            ind_type = ind_split[0]
            ind_prefix = '.'.join(ind_split[:-1])
            if ind_type == SeriesEnums.MODULE:
                if ind_prefix not in self.outputs.indicators:
                    if len(self.outputs.indicators) >= INDICATOR_LIMIT:
                        continue
                    self.outputs.indicators.add('.'.join(ind_prefix))


                res[ind] = s

        self.outputs.track(res)

    def get_track_summaries(self):
        res = self.outputs.get_track_summaries()

        return res

    def get_tracking(self):
        res = self.outputs.get_tracks()

        res.sort(key=lambda s: s['mean'], reverse=True)

        utils.remove_common_prefix(res, 'name')

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        outputs_key = OutputsIndex.get(run_uuid)

        if not outputs_key:
            o = OutputsModel()
            o.save()
            OutputsIndex.set(run_uuid, o.key)

            op = OutputsPreferencesModel()
            op.save()
            OutputsPreferencesIndex.set(run_uuid, op.key)

            return OutputsAnalysis(o)

        return OutputsAnalysis(outputs_key.load())

    @staticmethod
    def delete(run_uuid: str):
        outputs_key = OutputsIndex.get(run_uuid)
        preferences_key = OutputsPreferencesIndex.get(run_uuid)

        if outputs_key:
            o: OutputsModel = outputs_key.load()
            OutputsIndex.delete(run_uuid)
            o.delete()

        if preferences_key:
            op: OutputsPreferencesModel = preferences_key.load()
            OutputsPreferencesIndex.delete(run_uuid)
            op.delete()


@mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'outputs/<run_uuid>')
def get_modules_tracking(run_uuid: str) -> Any:
    track_data = []
    summary_data = []
    status_code = 404

    ans = OutputsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        summary_data = ans.get_track_summaries()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'outputs/preferences/<run_uuid>')
def get_modules_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = OutputsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    op: OutputsPreferencesModel = preferences_key.load()
    preferences_data = op.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'outputs/preferences/<run_uuid>')
def set_modules_preferences(run_uuid: str) -> Any:
    preferences_key = OutputsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return format_rv({})

    op = preferences_key.load()
    op.update_preferences(request.json)

    logger.debug(f'update outputs preferences: {op.key}')

    return format_rv({'errors': op.errors})
