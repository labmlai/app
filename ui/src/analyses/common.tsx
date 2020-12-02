import CACHE, {SeriesCache, SeriesPreferenceCache} from "../cache/cache"

export class Cache<TA extends SeriesCache, TAP extends SeriesPreferenceCache> {
    private readonly type: string
    private readonly seriesCaches: { [uuid: string]: SeriesCache }
    private readonly PreferencesCaches: { [uuid: string]: SeriesPreferenceCache }
    private readonly series: new (uuid: string, status: any) => TA
    private readonly preferences: new (uuid: string) => TAP


    constructor(type: string, series: new (uuid: string, status: any) => TA, preferences: new (uuid: string) => TAP) {
        this.type = type
        this.seriesCaches = {}
        this.PreferencesCaches = {}
        this.series = series
        this.preferences = preferences
    }

    getAnalysis(uuid: string) {
        let statusCache
        if (this.type === 'run') {
            statusCache = CACHE.getRunStatus(uuid)
        } else {
            statusCache = CACHE.getComputerStatus(uuid)
        }

        if (this.seriesCaches[uuid] == null) {
            this.seriesCaches[uuid] = new this.series(uuid, statusCache)
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
