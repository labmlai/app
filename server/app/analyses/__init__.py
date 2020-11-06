from typing import Dict

from . import analysis
from .parameters import ParametersAnalysis
from .time_tracking import TimeTrackingAnalysis
from .gradients import GradientsAnalysis
from .metrics import MetricsAnalysis
from .outputs import OutputsAnalysis
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
