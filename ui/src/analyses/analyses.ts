import {Analysis} from "./types"

import metricAnalysis from "./experiments/metrics"
import hyperPramsAnalysis from "./experiments/hyper_params"
import gradientAnalysis from "./experiments/grads"
import parameterAnalysis from "./experiments/params"
import moduleAnalysis from "./experiments/activations"
import stdOutAnalysis from "./experiments/stdout"
import stderrAnalysis from "./experiments/stderror"
import loggerAnalysis from "./experiments/logger"
import configsAnalysis from "./experiments/configs"

import cpuAnalysis from './computers/cpu'
import diskAnalysis from './computers/disk'
import {gpuMemoryAnalysis, gpuPowerAnalysis, gpuTempAnalysis, gpuUtilAnalysis} from './computers/gpu'
import memoryAnalysis from './computers/memory'
import networkAnalysis from './computers/network'
import processAnalysis from './computers/process'
import batteryAnalysis from './computers/battery'

let experimentAnalyses: Analysis[] = [
    metricAnalysis,
    configsAnalysis,
    hyperPramsAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    stdOutAnalysis,
    stderrAnalysis,
    loggerAnalysis
]

let computerAnalyses: Analysis[] = [
    cpuAnalysis,
    processAnalysis,
    memoryAnalysis,
    diskAnalysis,
    gpuUtilAnalysis,
    gpuTempAnalysis,
    gpuMemoryAnalysis,
    gpuPowerAnalysis,
    batteryAnalysis,
    networkAnalysis,
]

export {
    experimentAnalyses,
    computerAnalyses
}
