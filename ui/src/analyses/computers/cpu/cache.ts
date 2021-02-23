import {ComputerStatusCache, SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class CPUAnalysisCache extends SeriesCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'cpu', statusCache)
    }
}

class CPUPreferenceCache extends SeriesPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'cpu')
    }
}

let cpuCache = new AnalysisCache('computer', CPUAnalysisCache, CPUPreferenceCache)

export default cpuCache
