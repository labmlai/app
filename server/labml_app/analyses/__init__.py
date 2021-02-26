from typing import Dict, List

from . import analysis
from .series import SeriesModel
from ..analyses_settings import experiment_analyses, computer_analyses


class AnalysisManager:
    @staticmethod
    def track(run_uuid: str, data: Dict[str, SeriesModel]):
        for ans in experiment_analyses:
            ans.get_or_create(run_uuid).track(data)

    @staticmethod
    def track_computer(computer_uuid: str, data: Dict[str, SeriesModel]):
        for ans in computer_analyses:
            ans.get_or_create(computer_uuid).track(data)

    @staticmethod
    def delete_run(run_uuid: str):
        for ans in experiment_analyses:
            ans.delete(run_uuid)

    @staticmethod
    def delete_computer(computer_uuid: str):
        for ans in computer_analyses:
            ans.delete(computer_uuid)

    @staticmethod
    def get_handlers():
        return analysis.URLS

    @staticmethod
    def get_db_indexes():
        return analysis.DB_INDEXES

    @staticmethod
    def get_db_models():
        return analysis.DB_MODELS
