export interface AnalysisPreferenceModel {
    series_preferences: number[]
}

export class AnalysisPreference {
    public series_preferences: number[]

    constructor(preference: AnalysisPreferenceModel) {
        if (preference.series_preferences) {
            this.series_preferences = preference.series_preferences
        } else {
            this.series_preferences = []
        }
    }
}
