from typing import Dict, Any

from flask import make_response, request
from labml_db import Model, Index
from labml_db.serializer.pickle import PickleSerializer
from labml_db.serializer.yaml import YamlSerializer

from labml_app.logger import logger
from labml_app.enums import SeriesEnums
from labml_app.utils import format_rv
from labml_app.utils import mix_panel
from labml_app.settings import INDICATOR_LIMIT
from ..analysis import Analysis
from ..series import SeriesModel
from ..series_collection import SeriesCollection
from ..preferences import Preferences
from .. import utils


@Analysis.db_model(PickleSerializer, 'gradients')
class GradientsModel(Model['GradientsModel'], SeriesCollection):
    pass


@Analysis.db_model(PickleSerializer, 'gradients_preferences')
class GradientsPreferencesModel(Model['GradientsPreferencesModel'], Preferences):
    pass


@Analysis.db_index(YamlSerializer, 'gradients_preferences_index.yaml')
class GradientsPreferencesIndex(Index['GradientsPreferences']):
    pass


@Analysis.db_index(YamlSerializer, 'gradients_index.yaml')
class GradientsIndex(Index['Gradients']):
    pass


class GradientsAnalysis(Analysis):
    gradients: GradientsModel

    def __init__(self, data):
        self.gradients = data

    def track(self, data: Dict[str, SeriesModel]):
        res: Dict[str, SeriesModel] = {}
        for ind, s in data.items():
            ind_split = ind.split('.')
            ind_type = ind_split[0]
            ind_prefix = '.'.join(ind_split[:-1])
            if ind_type == SeriesEnums.GRAD:
                if ind_prefix not in self.gradients.indicators:
                    if len(self.gradients.indicators) >= INDICATOR_LIMIT:
                        continue
                    self.gradients.indicators.add('.'.join(ind_prefix))

                res[ind] = s

        self.gradients.track(res)

    def get_tracking(self):
        res = self.gradients.get_tracks()

        res.sort(key=lambda s: s['mean'], reverse=True)

        utils.remove_common_prefix(res, 'name')

        return res

    def get_track_summaries(self):
        res = self.gradients.get_track_summaries()

        return res

    @staticmethod
    def get_or_create(run_uuid: str):
        gradients_key = GradientsIndex.get(run_uuid)

        if not gradients_key:
            g = GradientsModel()
            g.save()
            GradientsIndex.set(run_uuid, g.key)

            gp = GradientsPreferencesModel()
            gp.save()
            GradientsPreferencesIndex.set(run_uuid, gp.key)

            return GradientsAnalysis(g)

        return GradientsAnalysis(gradients_key.load())

    @staticmethod
    def delete(run_uuid: str):
        gradients_key = GradientsIndex.get(run_uuid)
        preferences_key = GradientsPreferencesIndex.get(run_uuid)

        if gradients_key:
            g: GradientsModel = gradients_key.load()
            GradientsIndex.delete(run_uuid)
            g.delete()

        if preferences_key:
            gp: GradientsPreferencesModel = preferences_key.load()
            GradientsPreferencesIndex.delete(run_uuid)
            gp.delete()


@mix_panel.MixPanelEvent.time_this(None)
@Analysis.route('GET', 'gradients/<run_uuid>')
def get_grads_tracking(run_uuid: str) -> Any:
    track_data = []
    summary_data = []
    status_code = 404

    ans = GradientsAnalysis.get_or_create(run_uuid)
    if ans:
        track_data = ans.get_tracking()
        summary_data = ans.get_track_summaries()
        status_code = 200

    response = make_response(format_rv({'series': track_data, 'insights': [], 'summary': summary_data}))
    response.status_code = status_code

    return response


@Analysis.route('GET', 'gradients/preferences/<run_uuid>')
def get_grads_preferences(run_uuid: str) -> Any:
    preferences_data = {}

    preferences_key = GradientsPreferencesIndex.get(run_uuid)
    if not preferences_key:
        return format_rv(preferences_data)

    gp: GradientsPreferencesModel = preferences_key.load()
    preferences_data = gp.get_data()

    response = make_response(format_rv(preferences_data))

    return response


@Analysis.route('POST', 'gradients/preferences/<run_uuid>')
def set_grads_preferences(run_uuid: str) -> Any:
    preferences_key = GradientsPreferencesIndex.get(run_uuid)

    if not preferences_key:
        return format_rv({})

    gp = preferences_key.load()
    gp.update_preferences(request.json)

    logger.debug(f'update gradients preferences: {gp.key}')

    return format_rv({'errors': gp.errors})
