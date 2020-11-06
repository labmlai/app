from typing import List, Dict

from .series import SeriesModel


class Analysis:
    def track(self, data: Dict[str, SeriesModel]) -> None:
        raise NotImplementedError

    def get_tracking(self) -> List:
        raise NotImplementedError

    @staticmethod
    def get_or_create(run_uuid: str):
        raise NotImplementedError
