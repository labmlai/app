export interface AnalysisPreferenceModel {
    series_preferences: number[]
    chart_type: number
}

export class AnalysisPreference {
    series_preferences: number[]
    chart_type: number

    constructor(preference: AnalysisPreferenceModel) {
        if (preference.series_preferences) {
            this.series_preferences = preference.series_preferences
        } else {
            this.series_preferences = []
        }
        this.chart_type = preference.chart_type
    }
}
