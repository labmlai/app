import CACHE, {AnalysisCache, AnalysisPreferenceCache} from "../../../cache/cache";


export interface Analysis {
    card: any
    view: any
    route: string
}


export class Cache {
    private readonly analysisCaches: { [uuid: string]: AnalysisCache }
    private readonly PreferencesCaches: { [uuid: string]: AnalysisPreferenceCache }
    private readonly analysis: any
    private readonly preferences: any


    constructor(analysis: any, preferences: any) {
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
