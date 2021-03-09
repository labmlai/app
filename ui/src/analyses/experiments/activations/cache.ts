import {RunStatusCache, AnalysisCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class ActivationsAnalysisCache extends AnalysisCache {
    constructor(uuid: string, statusCache: RunStatusCache) {
        super(uuid, 'outputs', statusCache)
    }
}

class ActivationsPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'outputs')
    }
}

let activationsCache = new AnalysisCache('run', ActivationsAnalysisCache, ActivationsPreferenceCache)

export default activationsCache
