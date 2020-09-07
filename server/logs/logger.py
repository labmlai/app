import logging
from logging.handlers import RotatingFileHandler
from logging import StreamHandler

_FORMATTER = '%(asctime)s %(levelname)s :%(message)s'
_LOG_FORMATTER = logging.Formatter(_FORMATTER)
_DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
_LOG_PATH = 'app.log'
_MAX_BYTES = 100000


class Logger(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = object.__new__(cls)
            cls._instance.logger = logging.getLogger()
            cls._instance.logger.setLevel(logging.INFO)

            cls._instance.logger.addHandler(cls._instance._init_file_handler())

        return cls._instance

    @staticmethod
    def _init_streaming_handler():
        streaming = StreamHandler()
        streaming.setFormatter(_LOG_FORMATTER)

        return streaming

    @staticmethod
    def _init_file_handler():
        file_handler = RotatingFileHandler(filename=_LOG_PATH, maxBytes=_MAX_BYTES)
        file_handler.setFormatter(_LOG_FORMATTER)

        return file_handler

    def info(self, message, **kwargs):
        self._instance.logger.info(message, **kwargs)

    def debug(self, message, **kwargs):
        self._instance.logger.debug(message, **kwargs)

    def warning(self, message, **kwargs):
        self._instance.logger.warning(message, **kwargs)

    def error(self, message, **kwargs):
        self._instance.logger.error(message, **kwargs)

    def critical(self, message, **kwargs):
        self._instance.logger.critical(message, **kwargs)

    def exception(self, exception, **kwargs):
        self._instance.logger.exception(exception, **kwargs)


LOGGER = Logger()
