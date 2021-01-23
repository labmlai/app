import {Analysis} from "./types"

import gradientAnalysis from "./experiments/grads/card"
import metricAnalysis from "./experiments/metrics/card"
import parameterAnalysis from "./experiments/params/card"
//import timeAnalysis from "./experiments/times/card"
import moduleAnalysis from "./experiments/modules/card"
import stdOutAnalysis from "./experiments/stdout/card"
import stderrAnalysis from "./experiments/stderror/card"
import loggerAnalysis from "./experiments/logger/card"
import ConfigsAnalysis from "./experiments/configs/card"


import CpuAnalysis from "./computers/cpu/card"
import GPUAnalysis from "./computers/gpu/card"
import MemoryAnalysis from "./computers/memory/card"
import DiskAnalysis from "./computers/disk/card"
import NetworkAnalysis from "./computers/network/card"
import ProcessAnalysis from "./computers/process/card"

let experiment_analyses: Analysis[] = [
    metricAnalysis,
    ConfigsAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    // timeAnalysis,
    stdOutAnalysis,
    stderrAnalysis,
    loggerAnalysis
]

let computer_analyses: Analysis[] = [
    CpuAnalysis,
    GPUAnalysis,
    MemoryAnalysis,
    DiskAnalysis,
    NetworkAnalysis,
    ProcessAnalysis
]

export {
    experiment_analyses,
    computer_analyses
}