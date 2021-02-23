import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class MemoryAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'memory', statusCache)
    }
}

class MemoryPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'memory')
    }
}

let memoryCache = new AnalysisCache('computer', MemoryAnalysisCache, MemoryPreferenceCache)

export default memoryCache
