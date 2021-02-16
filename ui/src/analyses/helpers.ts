import CACHE, {RunStatusCache, SeriesCache, SeriesPreferenceCache} from "../cache/cache"


export class AnalysisCache<TA extends SeriesCache, TAP extends SeriesPreferenceCache> {
    private readonly series: new (uuid: string, status: any) => TA
    private readonly seriesCaches: { [uuid: string]: SeriesCache }
    private readonly preferences: new (uuid: string) => TAP
    private readonly preferencesCaches: { [uuid: string]: SeriesPreferenceCache }

    constructor(series: new (uuid: string, status: RunStatusCache) => TA, preferences: new (uuid: string) => TAP) {
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
        return CACHE.getRunStatus(uuid)
    }
}
