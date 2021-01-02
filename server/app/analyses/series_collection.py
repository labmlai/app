from typing import Dict, Any

from ..analyses.series import SeriesModel, Series
from ..enums import SeriesEnums


class SeriesCollection:
    tracking: Dict[str, SeriesModel]
    step: int

    @classmethod
    def defaults(cls):
        return dict(tracking={},
                    step=0,
                    )

    def get_tracks(self):
        res = []
        for ind, track in self.tracking.items():
            name = ind.split('.')
            if name[0] != SeriesEnums.TIME and name[-1] != 'l2':
                continue
            if name[-1] in ['mean', 'l2', 'l1']:
                name = name[:-1]
            name = name[1:]

            series: Dict[str, Any] = Series().load(track).detail
            series['name'] = '.'.join(name)

            res.append(series)

        return res

    def get_track_summaries(self):
        res = []
        for ind, track in self.tracking.items():
            name = ind.split('.')[1:]

            series: Dict[str, Any] = Series().load(track).summary
            series['name'] = '.'.join(name)

            res.append(series)

        return res


    def track(self, data: Dict[str, SeriesModel]) -> None:
        for ind, series in data.items():
            self.step = max(self.step, series['step'][-1])
            self._update_series(ind, series)

        self.save()

    def _update_series(self, ind: str, series: SeriesModel) -> None:
        if ind not in self.tracking:
            self.tracking[ind] = Series().to_data()

        s = Series().load(self.tracking[ind])
        s.update(series['step'], series['value'])

        self.tracking[ind] = s.to_data()



