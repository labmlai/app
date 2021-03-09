import {ComputerStatusCache, AnalysisDataCache, AnalysisPreferenceCache} from "../../../cache/cache"
import {AnalysisCache} from "../../helpers"

class CPUAnalysisCache extends AnalysisDataCache {
    constructor(uuid: string, statusCache: ComputerStatusCache) {
        super(uuid, 'cpu', statusCache)
    }
}

class CPUPreferenceCache extends AnalysisPreferenceCache {
    constructor(uuid: string) {
        super(uuid, 'cpu')
    }
}

let cpuCache = new AnalysisCache('computer', CPUAnalysisCache, CPUPreferenceCache)

export default cpuCache
