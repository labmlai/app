import {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class MetricsAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'metrics', statusCache)
    }
}

class MetricsPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'metrics')
    }
}

let metricsCache = new AnalysisCache('run', MetricsAnalysisCache, MetricsPreferenceCache)

export default metricsCache
