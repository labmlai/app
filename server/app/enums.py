class RunEnums:
    RUN_COMPLETED = 'completed'
    RUN_CRASHED = 'crashed'
    RUN_INTERRUPTED = 'interrupted'
    RUN_IN_PROGRESS = 'in progress'
    RUN_UNKNOWN = 'unknown'
    RUN_NOT_RESPONDING = 'no response'


class SeriesEnums:
    GRAD = 'grad'
    PARAM = 'param'
    MODULE = 'module'
    TIME = 'time'
    METRIC = 'metric'


class COMPUTEREnums:
    CPU = 'cpu'
    DISK = 'disk'
    MEMORY = 'memory'
    NETWORK = 'net'
    PROCESS = 'process'


class InsightEnums:
    DANGER = 'danger'
    WARNING = 'warning'
    SUCCESS = 'success'


INDICATORS = [SeriesEnums.GRAD,
              SeriesEnums.PARAM,
              SeriesEnums.TIME,
              SeriesEnums.MODULE,
              SeriesEnums.METRIC]
