from typing import List, Dict, Tuple, Callable

from labml_db.serializer.pickle import PickleSerializer
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
    def db_model(cls):
        DB_MODELS.append((PickleSerializer, cls, cls.path))

        return cls

    @staticmethod
    def db_index(cls):
        DB_INDEXES.append((PickleSerializer, cls, cls.path))

        return cls
