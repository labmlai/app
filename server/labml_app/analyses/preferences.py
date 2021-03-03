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

    def update_sub_series_preferences(self, data: PreferencesData):
        data = data.get('sub_series_preferences', {})
        for k, v in data.items():
            self.sub_series_preferences[k] = v

        self.save()

    def get_sub_series_preferences(self):
        res = {}
        for k, v in self.sub_series_preferences.items():
            if v:
                res[k] = v
            else:
                res[k] = []

        return res

    def get_data(self):
        return {
            'series_preferences': self.series_preferences,
            'chart_type': self.chart_type,
            'sub_series_preferences': self.get_sub_series_preferences(),
        }
