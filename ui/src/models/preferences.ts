export interface PreferenceModel {
    analyses_preferences: { [analysis: string]: any }
}

export class Preference {
    private analyses_preferences: { [analysis: string]: any }

    constructor(preference: PreferenceModel) {
        if (preference.analyses_preferences) {
            this.analyses_preferences = preference.analyses_preferences
        } else {
            this.analyses_preferences = {}
        }
    }

    public getAnalysis(analysis: string) {
        if (this.analyses_preferences) {
            return this.analyses_preferences[analysis]
        }

        return {}
    }

    public setAnalysis(analysis: string, data: any) {
        this.analyses_preferences[analysis] = data
    }
}
