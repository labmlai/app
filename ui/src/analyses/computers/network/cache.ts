import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class NetworkAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'network', statusCache)
    }
}

class NetworkPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'network')
    }
}

let networkCache = new AnalysisCache('computer', NetworkAnalysisCache, NetworkPreferenceCache)

export default networkCache
