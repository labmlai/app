import {Analysis} from "./types"

import metricAnalysis from "./experiments/metrics/init"
import gradientAnalysis from "./experiments/grads/init"
import parameterAnalysis from "./experiments/params/init"
import moduleAnalysis from "./experiments/activations/init"
import stdOutAnalysis from "./experiments/stdout/init"
import stderrAnalysis from "./experiments/stderror/init"
import loggerAnalysis from "./experiments/logger/init"
import configsAnalysis from "./experiments/configs/init"
import cpuAnalysis from './computers/cpu/init';

let experimentAnalyses: Analysis[] = [
    metricAnalysis,
    configsAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    stdOutAnalysis,
    stderrAnalysis,
    loggerAnalysis
]

let computerAnalyses: Analysis[] = [
    cpuAnalysis,
]

export {
    experimentAnalyses,
    computerAnalyses
}
