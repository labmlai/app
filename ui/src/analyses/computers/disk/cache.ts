import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class DiskAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'disk', statusCache)
    }
}

class DiskPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'disk')
    }
}

let diskCache = new AnalysisCache('computer', DiskAnalysisCache, DiskPreferenceCache)

export default diskCache
