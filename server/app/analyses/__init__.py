from typing import Dict

from . import analysis
from .series import SeriesModel
from .experiments.parameters import ParametersAnalysis
from .experiments.time_tracking import TimeTrackingAnalysis
from .experiments.gradients import GradientsAnalysis
from .experiments.metrics import MetricsAnalysis
from .experiments.outputs import OutputsAnalysis
from .computers.cpu import CPUAnalysis
from .computers.memory import MemoryAnalysis
from .computers.network import NetworkAnalysis
from .computers.disk import DiskAnalysis
from .computers.process import ProcessAnalysis

experiment_analyses = [GradientsAnalysis,
                       OutputsAnalysis,
                       ParametersAnalysis,
                       TimeTrackingAnalysis,
                       MetricsAnalysis]

computer_analyses = [CPUAnalysis,
                     MemoryAnalysis,
                     NetworkAnalysis,
                     DiskAnalysis,
                     ProcessAnalysis]


class AnalysisManager:
    @staticmethod
    def track(run_uuid: str, data: Dict[str, SeriesModel]):
        for ans in experiment_analyses:
            ans.get_or_create(run_uuid).track(data)

    @staticmethod
    def track_computer(computer_uuid: str, data: Dict[str, SeriesModel]):
        for ans in computer_analyses:
            ans.get_or_create(computer_uuid).track(data)

    @staticmethod
    def get_handlers():
        return analysis.URLS

    @staticmethod
    def get_db_indexes():
        return analysis.DB_INDEXES

    @staticmethod
    def get_db_models():
        return analysis.DB_MODELS
