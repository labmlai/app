import {RunStatusCache, AnalysisCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class GradientAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'gradients', statusCache)
    }
}

class GradientPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'gradients')
    }
}

let gradientsCache = new AnalysisCache('run', GradientAnalysisCache, GradientPreferenceCache)

export default gradientsCache
