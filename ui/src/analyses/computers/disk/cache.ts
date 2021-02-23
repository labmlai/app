import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class DiskAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'disk', statusCache)
    }
}

class DiskPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'disk')
    }
}

let diskCache = new AnalysisCache('computer', DiskAnalysisCache, DiskPreferenceCache)

export default diskCache
