import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class GPUAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'gpu', statusCache)
    }
}

class GPUPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gpu')
    }
}

let gpuCache = new AnalysisCache('computer', GPUAnalysisCache, GPUPreferenceCache)

export default gpuCache
