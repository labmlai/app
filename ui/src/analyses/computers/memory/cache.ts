import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class MemoryAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'memory', statusCache)
    }
}

class MemoryPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'memory')
    }
}

let memoryCache = new AnalysisCache('computer', MemoryAnalysisCache, MemoryPreferenceCache)

export default memoryCache
