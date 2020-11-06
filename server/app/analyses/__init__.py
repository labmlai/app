from .parameters import ParametersAnalysis, ParametersModel, ParametersIndex
from .time_tracking import TimeTrackingAnalysis, TimeTrackingModel, TimeTrackingIndex
from .gradients import GradientsAnalysis, GradientsModel, GradientsIndex
from .metrics import MetricsAnalysis, MetricsModel, MetricsIndex
from .outputs import OutputsAnalysis, OutputsIndex, OutputsModel
from . import analysis

from ..enums import SeriesEnums


class AnalysisManager:
    @staticmethod
    def get_or_create(run_uuid: str, ans: str):
        if ans == SeriesEnums.GRAD:
            return GradientsAnalysis.get_or_create(run_uuid)
        elif ans == SeriesEnums.MODULE:
            return OutputsAnalysis.get_or_create(run_uuid)
        elif ans == SeriesEnums.PARAM:
            return ParametersAnalysis.get_or_create(run_uuid)
        elif ans == SeriesEnums.TIME:
            return TimeTrackingAnalysis.get_or_create(run_uuid)
        else:
            return MetricsAnalysis.get_or_create(run_uuid)

    @staticmethod
    def get_handlers():
        return analysis.URLS

    @staticmethod
    def get_db_indexes():
        return analysis.DB_INDEXES

    @staticmethod
    def get_db_models():
        return analysis.DB_MODELS
