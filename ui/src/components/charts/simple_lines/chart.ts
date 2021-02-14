import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"

export class SimpleLinesChart {
    series: SeriesModel[]
    chartWidth: number
    chartHeight

    constructor(opt: ChartOptions) {
        this.series = opt.series

        let windowWidth = opt.width
        const margin = Math.floor(windowWidth / 64)
        const axisSize = 30
        this.chartWidth = windowWidth - 2 * margin - axisSize
        this.chartHeight = Math.round(this.chartWidth / 4)
    }

    render($: WeyaElementFunction) {
        if (this.series.length === 0) {
            $('div', '')
        } else {

        }

    }
}