from typing import Dict, List, Any

from labml_db import Model
from ..analyses.series import SeriesModel, Series
from ..enums import SeriesEnums


class SeriesCollection(Model['Series']):
    tracking: Dict[str, SeriesModel]
    step: int
    types: Dict[str, List[str]]

    @classmethod
    def defaults(cls):
        return dict(tracking={},
                    step=0,
                    types={}
                    )

    def get_track(self, ind: str) -> SeriesModel:
        s = self.tracking[ind]
        series: Dict[str, Any] = Series().load(s).summary
        name = ind.split('.')
        if name[-1] in ['mean', 'l2', 'l1']:
            name = name[:-1]
        if name[0] in [SeriesEnums.GRAD, SeriesEnums.TIME, SeriesEnums.MODULE, SeriesEnums.PARAM]:
            name = name[1:]
        series['name'] = '.'.join(name)

        return series

    def track(self, data: Dict[str, SeriesModel]) -> None:
        for ind, series in data.items():
            self.step = max(self.step, series['step'][-1])
            self._update_series(ind, series)

        self.save()

    def _update_series(self, ind: str, series: SeriesModel) -> None:
        if ind not in self.tracking:
            self.tracking[ind] = Series().to_data()
            self.update_type(ind)

        s = Series().load(self.tracking[ind])
        s.update(series['step'], series['value'])

        self.tracking[ind] = s.to_data()

    def update_type(self, name: str) -> None:
        ind_type = name.split('.')[0]
        if ind_type in self.types.keys():
            self.types[ind_type].append(name)
        else:
            self.types[SeriesEnums.METRIC].append(name)
