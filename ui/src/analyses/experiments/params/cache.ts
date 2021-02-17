import {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers";

class ParameterAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'parameters', statusCache)
    }
}

class ParameterPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'parameters')
    }
}

let parametersCache = new AnalysisCache(ParameterAnalysisCache, ParameterPreferenceCache)

export default parametersCache