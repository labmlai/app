import CACHE, {ComputerStatusCache, RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../cache/cache"
import {ContentType} from '../types'


export class AnalysisCache<TA extends SeriesCache, TAP extends SeriesPreferenceCache> {
    private readonly type: ContentType
    private readonly series: new (uuid: string, status: RunStatusCache | ComputerStatusCache) => TA
    private readonly seriesCaches: { [uuid: string]: SeriesCache }
    private readonly preferences: new (uuid: string) => TAP
    private readonly preferencesCaches: { [uuid: string]: SeriesPreferenceCache }

    constructor(type: ContentType, series: new (uuid: string, status: RunStatusCache | ComputerStatusCache) => TA, preferences: new (uuid: string) => TAP) {
        this.type = type
        this.seriesCaches = {}
        this.preferencesCaches = {}
        this.series = series
        this.preferences = preferences
    }

    getAnalysis(uuid: string) {
        if (this.seriesCaches[uuid] == null) {
            this.seriesCaches[uuid] = new this.series(uuid, this.getStatus(uuid))
        }

        return this.seriesCaches[uuid]
    }

    getPreferences(uuid: string) {
        if (this.preferencesCaches[uuid] == null) {
            this.preferencesCaches[uuid] = new this.preferences(uuid)
        }

        return this.preferencesCaches[uuid]
    }

    private getStatus(uuid: string) {
        if (this.type === 'run') {
            return CACHE.getRunStatus(uuid)
        } else if (this.type === 'computer') {
            return CACHE.getComputerStatus(uuid)
        }

        return null
    }
}
