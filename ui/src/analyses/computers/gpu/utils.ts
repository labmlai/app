import {SeriesModel} from "../../../models/run"
import {toPointValues} from "../../../components/charts/utils"

export function getSeriesData(series: SeriesModel[], analysis: string) {
    let res = []
    for (let s of series) {
        if (s.name.includes(analysis)) {
            res.push(s)
        }
    }

    return  toPointValues(res)
}