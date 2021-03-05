import {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class HyperPramsAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'hyper_params', statusCache)
    }
}

class HyperPramsPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'hyper_params')
    }
}

let hyperParamsCache = new AnalysisCache('run', HyperPramsAnalysisCache, HyperPramsPreferenceCache)

export default hyperParamsCache
