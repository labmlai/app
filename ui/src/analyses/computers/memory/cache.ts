import {ComputerStatusCache, AnalysisCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class MemoryAnalysisCache extends AnalysisCache {
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
