import {Analysis} from "./types"

import metricAnalysis from "./experiments/metrics/init"
import gradientAnalysis from "./experiments/grads/init"
import parameterAnalysis from "./experiments/params/init"
import moduleAnalysis from "./experiments/activations/init"
import stdOutAnalysis from "./experiments/stdout/init"
import stderrAnalysis from "./experiments/stderror/init"
import loggerAnalysis from "./experiments/logger/init"
import runHeaderAnalysis from "./experiments/run_header/init"

let experimentAnalyses: Analysis[] = [
    runHeaderAnalysis,
    metricAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    stdOutAnalysis,
    stderrAnalysis,
    loggerAnalysis
]

export {
    experimentAnalyses,
}