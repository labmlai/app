from typing import Dict, List

from labml_db import Model, Index


class Preferences(Model['Preferences']):
    series_preferences: Dict[str, List[int]]
    errors: List[Dict[str, str]]

    @classmethod
    def defaults(cls):
        return dict(series_preferences={},
                    errors=[]
                    )

    def update_preferences(self, data: Dict[str, any]) -> None:
        for k, v in data.items():
            if v:
                self.series_preferences[k] = v

        self.save()

    def get_data(self):
        return {
            'series_preferences': self.series_preferences
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
