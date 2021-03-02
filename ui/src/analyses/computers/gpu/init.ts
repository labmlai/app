import {GPUUtilCard} from "./util_card"
import {GPUTempCard} from "./temp_card"
import {GPUMemoryCard} from "./memory_card"
import {GPUUtilHandler} from "./util_view"
import {GPUTempHandler} from "./temp_view"
import {GPUMemoryHandler} from "./memory_view"
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

let gpuMemoryAnalysis: Analysis = {
    card: GPUMemoryCard,
    viewHandler: GPUMemoryHandler,
    route: 'gpu_memory'
}


export  {
    gpuUtilAnalysis,
    gpuTempAnalysis,
    gpuMemoryAnalysis
}
