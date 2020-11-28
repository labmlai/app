import {Analysis} from "./types"

import gradientAnalysis from "./experiments/grads/card"
import metricAnalysis from "./experiments/metrics/card"
import parameterAnalysis from "./experiments/params/card"
import timeAnalysis from "./experiments/times/card"
import moduleAnalysis from "./experiments/modules/card"

let analyses: Analysis[] = [
    metricAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    // timeAnalysis,
]

export default analyses