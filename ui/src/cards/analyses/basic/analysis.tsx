import CACHE, {SeriesCache, SeriesPreferenceCache, StatusCache} from "../../../cache/cache";


export interface Analysis {
    card: any
    view: any
    route: string
}


export class Cache<TA extends SeriesCache, TAP extends SeriesPreferenceCache> {
    private readonly analysisCaches: { [uuid: string]: SeriesCache }
    private readonly PreferencesCaches: { [uuid: string]: SeriesPreferenceCache }
    private readonly analysis: new (uuid: string, status: StatusCache) => TA
    private readonly preferences: new (uuid: string) => TAP


    constructor(analysis: new (uuid: string, status: StatusCache) => TA, preferences: new (uuid: string) => TAP) {
        this.analysisCaches = {}
        this.PreferencesCaches = {}
        this.analysis = analysis
        this.preferences = preferences
    }

    getAnalysis(uuid: string) {
        if (this.analysisCaches[uuid] == null) {
            this.analysisCaches[uuid] = new this.analysis(uuid, CACHE.getStatus(uuid))
        }

        return this.analysisCaches[uuid]
    }

    getPreferences(uuid: string) {
        if (this.PreferencesCaches[uuid] == null) {
            this.PreferencesCaches[uuid] = new this.preferences(uuid)
        }

        return this.PreferencesCaches[uuid]
    }
}
