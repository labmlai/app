from .app_analyses.experiments.parameters import ParametersAnalysis
from .app_analyses.experiments.time_tracking import TimeTrackingAnalysis
from .app_analyses.experiments.gradients import GradientsAnalysis
from .app_analyses.experiments.metrics import MetricsAnalysis
from .app_analyses.experiments.outputs import OutputsAnalysis
from .app_analyses.computers.cpu import CPUAnalysis
from .app_analyses.computers.memory import MemoryAnalysis
from .app_analyses.computers.network import NetworkAnalysis
from .app_analyses.computers.disk import DiskAnalysis
from .app_analyses.computers.process import ProcessAnalysis

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