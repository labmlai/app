export interface PreferenceModel {
    analyses_preferences: { [analysis: string]: any }
}

export class Preference {
    private analyses_preferences: { [uuid: string]: { [analysis: string]: any } }

    constructor(preference: PreferenceModel) {
        if (preference.analyses_preferences) {
            this.analyses_preferences = preference.analyses_preferences
        } else {
            this.analyses_preferences = {}
        }
    }

    public getAnalysis(uuid: string, analysis: string) {
        if (this.analyses_preferences[uuid]) {
            return this.analyses_preferences[uuid][analysis]
        }

        this.analyses_preferences[uuid] = {}

        return {}
    }

    public setAnalysis(uuid: string, analysis: string, data: any) {
        this.analyses_preferences[uuid][analysis] = data
    }
}
