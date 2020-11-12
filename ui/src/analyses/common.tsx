import CACHE, {SeriesCache, SeriesPreferenceCache, StatusCache} from "../cache/cache"

export class Cache<TA extends SeriesCache, TAP extends SeriesPreferenceCache> {
    private readonly seriesCaches: { [uuid: string]: SeriesCache }
    private readonly PreferencesCaches: { [uuid: string]: SeriesPreferenceCache }
    private readonly series: new (uuid: string, status: StatusCache) => TA
    private readonly preferences: new (uuid: string) => TAP


    constructor(series: new (uuid: string, status: StatusCache) => TA, preferences: new (uuid: string) => TAP) {
        this.seriesCaches = {}
        this.PreferencesCaches = {}
        this.series = series
        this.preferences = preferences
    }

    getAnalysis(uuid: string) {
        if (this.seriesCaches[uuid] == null) {
            this.seriesCaches[uuid] = new this.series(uuid, CACHE.getStatus(uuid))
        }

        return this.seriesCaches[uuid]
    }

    getPreferences(uuid: string) {
        if (this.PreferencesCaches[uuid] == null) {
            this.PreferencesCaches[uuid] = new this.preferences(uuid)
        }

        return this.PreferencesCaches[uuid]
    }
}
