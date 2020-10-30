import logging
from logging.handlers import RotatingFileHandler
from logging import StreamHandler

_FORMATTER = '%(asctime)s %(levelname)s :%(message)s'
_LOG_FORMATTER = logging.Formatter(_FORMATTER)
_DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
_LOG_PATH = 'app.log'
_MAX_BYTES = 100000


class CustomFormatter(logging.Formatter):
    """Logging Formatter to add colors and count warning / errors"""

    grey = "\x1b[38;21m"
    blue = "\x1b[36;21m"
    yellow = "\x1b[33;21m"
    red = "\x1b[31;21m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"

    FORMATS = {
        logging.DEBUG: grey + format + reset,
        logging.INFO: blue + format + reset,
        logging.WARNING: yellow + format + reset,
        logging.ERROR: red + format + reset,
        logging.CRITICAL: bold_red + format + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


class Logger(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = object.__new__(cls)
            cls._instance.logger = logging.getLogger()
            cls._instance.logger.setLevel(logging.INFO)

            cls._instance.logger.addHandler(cls._instance._init_streaming_handler())

        return cls._instance

    @staticmethod
    def _init_streaming_handler():
        streaming = StreamHandler()
        streaming.setFormatter(CustomFormatter())

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
