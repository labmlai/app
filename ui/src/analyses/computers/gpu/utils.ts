import {SeriesModel} from "../../../models/run"
import {toPointValues} from "../../../components/charts/utils"

export function getSeriesData(series: SeriesModel[], analysis: string, isMean: boolean = false) {
    let res = []
    for (let s of series) {
        if (s.name.includes(analysis)) {
            if (s.name.includes('mean')) {
                if (isMean) {
                    s.name = 'mean'
                    return toPointValues([s])
                } else {
                    continue
                }
            }
            s.name = s.name.replace(/\D/g, '')
            res.push(s)
        }
    }

    return toPointValues(res)
}