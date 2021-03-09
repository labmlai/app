import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

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

export default processCache
