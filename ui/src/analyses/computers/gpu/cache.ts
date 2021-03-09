import {ComputerStatusCache, AnalysisCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class GPUAnalysisCache extends AnalysisCache {
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
