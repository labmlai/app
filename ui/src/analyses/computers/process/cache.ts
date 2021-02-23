import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class ProcessAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'process', statusCache)
    }
}

class ProcessPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'process')
    }
}

let processCache = new AnalysisCache('computer', ProcessAnalysisCache, ProcessPreferenceCache)

export default processCache
