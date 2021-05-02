from typing import Dict, List, Any

PreferencesData = Dict[str, Any]
SeriesPreferences = List[int]


class Preferences:
    series_preferences: SeriesPreferences
    sub_series_preferences: Dict[str, SeriesPreferences]
    chart_type: int
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(series_preferences=[],
                    sub_series_preferences={},
                    chart_type=0,
                    errors=[]
                    )

    def update_preferences(self, data: PreferencesData) -> None:
        if 'series_preferences' in data:
            self.update_series_preferences(data['series_preferences'])

        if 'chart_type' in data:
            self.chart_type = data['chart_type']

        self.save()

    def update_series_preferences(self, data: SeriesPreferences) -> None:
        self.series_preferences = data

    def update_sub_series_preferences(self, data: PreferencesData) -> None:
        data = data.get('sub_series_preferences', {})
        for k, v in data.items():
            self.sub_series_preferences[k] = v

        self.save()

    def get_sub_series_preferences(self) -> Dict[str, SeriesPreferences]:
        res = {}
        for k, v in self.sub_series_preferences.items():
            if v:
                res[k] = v
            else:
                res[k] = []

        return res

    def get_data(self) -> Dict[str, Any]:
        return {
            'series_preferences': self.series_preferences,
            'chart_type': self.chart_type,
            'sub_series_preferences': self.get_sub_series_preferences(),
        }


class ComparisonPreferences(Preferences):
    base_series_preferences: SeriesPreferences
    base_experiment: str

    @classmethod
    def defaults(cls):
        outp = super().defaults()
        outp["base_series_preferences"] = []
        outp["base_experiment"] = ""
        return outp

    def update_preferences(self, data: PreferencesData) -> None:
        if 'base_series_preferences' in data:
            self.update_base_series_preferences(data['base_series_preferences'])

        if 'base_experiment' in data:
            self.base_experiment = data['base_experiment']

        super().update_preferences(data)

    def update_base_series_preferences(self, data: SeriesPreferences) -> None:
        self.base_series_preferences = data

    def get_data(self) -> Dict[str, Any]:
        outp = super().get_data()
        outp["base_series_preferences"] = self.base_series_preferences
        outp["base_experiment"] = self.base_experiment
        
        return outp
