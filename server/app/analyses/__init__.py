from labml_db import Model

from .series_collection import SeriesCollection

from ..enums import SeriesEnums, INDICATORS


class Analyses(SeriesCollection):
    @staticmethod
    def create_analyses():
        res = {}
        for _cls in Analyses.__subclasses__():
            analyses = _cls()
            if analyses.type in INDICATORS:
                analyses.save()
                res[analyses.type] = analyses.key

        return res


class Metrics(Model['Metrics'], Analyses):
    type = SeriesEnums.METRIC


class Gradients(Model['Gradients'], Analyses):
    type = SeriesEnums.GRAD


class Parameters(Model['Parameters'], Analyses):
    type = SeriesEnums.PARAM


class Outputs(Model['Output'], Analyses):
    type = SeriesEnums.MODULE


class TimeTracking(Model['TimeTracking'], Analyses):
    type = SeriesEnums.TIME
