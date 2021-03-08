from typing import Dict, Any

from ..analyses.series import SeriesModel, Series

class SeriesCollection:
    tracking: Dict[str, SeriesModel]
    indicators: set
    step: int

    @classmethod
    def defaults(cls):
        return dict(tracking={},
                    step=0,
                    indicators=set()
                    )

    def get_tracks(self):
        res = []
        is_series_updated = False
        for ind, track in self.tracking.items():
            name = ind.split('.')
            if name[-1] not in ['l2', 'var']:
                continue
            if name[-1] in ['mean', 'l2', 'l1', 'var']:
                name = name[:-1]
            name = name[1:]

            s = Series().load(track)
            series: Dict[str, Any] = s.detail
            series['name'] = '.'.join(name)

            if s.is_smoothed_updated:
                self.tracking[ind] = s.to_data()
                is_series_updated = True

            res.append(series)

        if is_series_updated:
            self.save()

        return res

    def get_track_summaries(self):
        data = {}
        inds = set()
        for ind, track in self.tracking.items():
            name_split = ind.split('.')
            ind = name_split[-1]
            name = '.'.join(name_split[1:-1])

            series: Dict[str, Any] = Series().load(track).summary

            if name in data:
                data[name][ind] = series['mean']
            else:
                data[name] = {ind: series['mean']}

            inds.add(ind)

        if not data:
            return []

        sort_key = 'l2' if 'l2' in inds else 'var'

        res = [v for k, v in data.items() if sort_key in v]
        sorted_res = sorted(res, key=lambda k: k['l2' if 'l2' in inds else 'var'])

        ret = {}
        for d in sorted_res:
            for k, v in d.items():
                if k not in ret:
                    ret[k] = {'name': k, 'value': []}
                else:
                    ret[k]['value'].append(v)

        return [v for k, v in ret.items()]

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

    def save(self):
        raise NotImplementedError
