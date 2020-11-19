from typing import Dict

from .series import SeriesModel

URLS = []
DB_MODELS = []
DB_INDEXES = []


class Analysis:
    def track(self, data: Dict[str, SeriesModel]) -> None:
        raise NotImplementedError

    @staticmethod
    def get_or_create(run_uuid: str):
        raise NotImplementedError

    @staticmethod
    def route(method: str, url: str):
        def decorator(f):
            URLS.append((method, f, url))
            return f

        return decorator

    @staticmethod
    def db_model(serializer: any, path: str):
        def decorator(cls):
            DB_MODELS.append((serializer, cls, path))

            return cls

        return decorator

    @staticmethod
    def db_index(serializer: any, path: str):
        def decorator(cls):
            DB_INDEXES.append((serializer, cls, path))

            return cls

        return decorator
