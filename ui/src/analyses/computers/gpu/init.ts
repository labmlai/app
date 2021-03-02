import {GPUUtilCard} from "./util_card"
import {GPUUtilHandler} from "./util_view"
import {GPUTempCard} from "./temp_card"
import {GPUTempHandler} from "./temp_view"
import {Analysis} from "../../types"


let gpuUtilAnalysis: Analysis = {
    card: GPUUtilCard,
    viewHandler: GPUUtilHandler,
    route: 'gpu_util'
}

let gpuTempAnalysis: Analysis = {
    card: GPUTempCard,
    viewHandler: GPUTempHandler,
    route: 'gpu_temp'
}


export  {
    gpuUtilAnalysis,
    gpuTempAnalysis
}
