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
import diskAnalysis from './computers/disk/init';
import gpuAnalysis from './computers/gpu/init';
import memoryAnalysis from './computers/memory/init';
import networkAnalysis from './computers/network/init';
import processAnalysis from './computers/process/init';

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
    gpuAnalysis,
    memoryAnalysis,
    diskAnalysis,
    networkAnalysis,
    processAnalysis
]

export {
    experimentAnalyses,
    computerAnalyses
}
