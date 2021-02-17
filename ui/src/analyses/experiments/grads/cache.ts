import {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache";
import {AnalysisCache} from "../../helpers";

class GradientAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'gradients', statusCache)
    }
}

class GradientPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gradients')
    }
}

let gradientsCache = new AnalysisCache(GradientAnalysisCache, GradientPreferenceCache)

export default gradientsCache