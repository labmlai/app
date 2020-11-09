from typing import Dict, List, Any

from labml_db import Model

PreferencesData = Dict[str, Any]
AnalysisPreferencesData = Dict[str, Dict[str, Any]]


class Preferences(Model['Preferences']):
    analyses_preferences: AnalysisPreferencesData
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(analyses_preferences={},
                    errors=[]
                    )

    def update_preferences(self, data: PreferencesData) -> None:
        if 'analyses_preferences' in data:
            self.update_analyses_preferences(data['analyses_preferences'])

        self.save()

    def update_analyses_preferences(self, data: AnalysisPreferencesData) -> None:
        for run_uuid, analysis in data.items():
            if run_uuid not in self.analyses_preferences:
                self.analyses_preferences[run_uuid] = {}

            if analysis:
                for k, v in analysis.items():
                    if v:
                        self.analyses_preferences[run_uuid][k] = v

    def get_data(self):
        return {
            'analyses_preferences': self.analyses_preferences
        }
