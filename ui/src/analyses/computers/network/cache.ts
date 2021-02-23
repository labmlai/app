import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class NetworkAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'network', statusCache)
    }
}

class NetworkPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'network')
    }
}

let networkCache = new AnalysisCache('computer', NetworkAnalysisCache, NetworkPreferenceCache)

export default networkCache
