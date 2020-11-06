from .parameters import ParametersAnalysis, Parameters, ParametersIndex
from .time_tracking import TimeTrackingAnalysis, TimeTracking, TimeTrackingIndex
from .gradients import GradientsAnalysis, Gradients, GradientsIndex
from .metrics import MetricsAnalysis, Metrics, MetricsIndex
from .outputs import OutputsAnalysis, Outputs, OutputsIndex

from ..enums import SeriesEnums


class AnalysisManager:
    @staticmethod
    def get_or_create(run_uuid: str, analysis: str):
        if analysis == SeriesEnums.GRAD:
            return GradientsAnalysis.get_or_create(run_uuid)
        elif analysis == SeriesEnums.MODULE:
            return OutputsAnalysis.get_or_create(run_uuid)
        elif analysis == SeriesEnums.PARAM:
            return ParametersAnalysis.get_or_create(run_uuid)
        elif analysis == SeriesEnums.TIME:
            return TimeTrackingAnalysis.get_or_create(run_uuid)
        else:
            return MetricsAnalysis.get_or_create(run_uuid)
