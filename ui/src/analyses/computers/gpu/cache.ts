import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class GPUAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'gpu', statusCache)
    }
}

class GPUPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gpu')
    }
}

let gpuCache = new AnalysisCache('computer', GPUAnalysisCache, GPUPreferenceCache)

export default gpuCache
