from typing import Dict, List, Any

PreferencesData = Dict[str, Any]
SeriesPreferences = List[int]


class Preferences:
    series_preferences: SeriesPreferences
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(series_preferences={},
                    errors=[]
                    )

    def update_preferences(self, data: PreferencesData) -> None:
        if 'series_preferences' in data:
            self.update_series_preferences(data['series_preferences'])

        self.save()

    def update_series_preferences(self, data: SeriesPreferences) -> None:
        self.series_preferences = data

    def get_data(self):
        return {
            'series_preferences': self.series_preferences
        }
