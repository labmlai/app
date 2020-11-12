import {Analysis} from "./types"

import gradientAnalysis from "./grads/card"
import metricAnalysis from "./metrics/card"
import parameterAnalysis from "./params/card"
import timeAnalysis from "./times/card"
import moduleAnalysis from "./modules/card"

let analyses: Analysis[] = [
    metricAnalysis,
    gradientAnalysis,
    parameterAnalysis,
    moduleAnalysis,
    timeAnalysis,
]

export default analyses