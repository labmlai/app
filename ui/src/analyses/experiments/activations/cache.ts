import {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache";
import {AnalysisCache} from "../../helpers";

class ActivationsAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'outputs', statusCache)
    }
}

class ActivationsPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'outputs')
    }
}

let activationsCache = new AnalysisCache(ActivationsAnalysisCache, ActivationsPreferenceCache)

export default activationsCache