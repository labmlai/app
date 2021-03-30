import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"
import {DetailsCache, DetailsDataCache} from "./cache_helper"

class ProcessAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'process', statusCache)
    }
}

class ProcessPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'process')
    }
}

let processCache = new AnalysisCache('computer', ProcessAnalysisCache, ProcessPreferenceCache)


class ProcessDetailsCache extends DetailsDataCache {
    constructor(uuid: string, processId: string, statusCache: ComputerStatusCache) {
        super(uuid, processId, statusCache)
    }
}

let processDetailsCache = new DetailsCache(ProcessDetailsCache)

export {
    processCache,
    processDetailsCache
}
