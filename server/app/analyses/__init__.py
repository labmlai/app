from typing import Dict

from .parameters import ParametersAnalysis, ParametersModel, ParametersIndex
from .time_tracking import TimeTrackingAnalysis, TimeTrackingModel, TimeTrackingIndex
from .gradients import GradientsAnalysis, GradientsModel, GradientsIndex
from .metrics import MetricsAnalysis, MetricsModel, MetricsIndex
from .outputs import OutputsAnalysis, OutputsIndex, OutputsModel
from . import analysis
from .series import SeriesModel

Analyses = [GradientsAnalysis,
            OutputsAnalysis,
            ParametersAnalysis,
            TimeTrackingAnalysis,
            MetricsAnalysis]


class AnalysisManager:
    @staticmethod
    def track(run_uuid: str, data: Dict[str, SeriesModel]):
        for ans in Analyses:
            ans.get_or_create(run_uuid).track(data)

    @staticmethod
    def get_handlers():
        return analysis.URLS

    @staticmethod
    def get_db_indexes():
        return analysis.DB_INDEXES

    @staticmethod
    def get_db_models():
        return analysis.DB_MODELS
