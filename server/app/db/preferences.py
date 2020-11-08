from typing import Dict, List, Any

from labml_db import Model, Index


class Preferences(Model['Preferences']):
    analyses_preferences: Dict[str, Any]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(analyses_preferences={},
                    errors=[]
                    )

    def update_preferences(self, data: Dict[str, Any]) -> None:
        for k, v in data['analyses_preferences'].items():
            if v:
                self.analyses_preferences[k] = v

        self.save()

    def get_data(self):
        return {
            'analyses_preferences': self.analyses_preferences
        }


class PreferencesIndex(Index['Preferences']):
    pass


def get_or_create(run_uuid: str) -> Preferences:
    rp_key = PreferencesIndex.get(run_uuid)

    if not rp_key:
        rp = Preferences()
        rp.save()

        PreferencesIndex.set(run_uuid, rp.key)

        return rp

    return rp_key.load()
