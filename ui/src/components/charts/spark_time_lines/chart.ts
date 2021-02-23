import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {getExtent, toDate} from "../utils"
import {SparkTimeLine} from "./spark_time_line"
import {getColor} from "../constants"


interface SparkTimeLinesOptions extends ChartOptions {
    plotIdx: number[]
    onSelect?: (i: number) => void
}

export class SparkTimeLines {
    series: SeriesModel[]
    plotIdx: number[]
    rowWidth: number
    minLastValue: number
    maxLastValue: number
    stepExtent: [number, number]
    colorIndices: number[] = []
    onSelect?: (i: number) => void

    constructor(opt: SparkTimeLinesOptions) {
        this.series = opt.series
        this.plotIdx = opt.plotIdx
        this.onSelect = opt.onSelect

        const margin = Math.floor(opt.width / 64)
        this.rowWidth = Math.min(450, opt.width - 3 * margin)

        let lastValues: number[] = []
        for (let s of this.series) {
            let series = s.series
            lastValues.push(series[series.length - 1].value)
        }

        this.maxLastValue = Math.max(...lastValues)
        this.minLastValue = Math.min(...lastValues)

        this.stepExtent = getExtent(this.series.map(s => s.series), d => d.step)

        for (let i = 0; i < this.plotIdx.length; i++) {
            if (this.plotIdx[i] >= 0) {
                this.colorIndices.push(i)
            } else {
                this.colorIndices.push(-1)
            }
        }
    }

    render($: WeyaElementFunction) {
        $('div.sparkline-list.list-group', $ => {
            this.series.map((s, i) => {
                let onClick
                if (this.onSelect != null) {
                    onClick = this.onSelect.bind(null, i)
                }
                new SparkTimeLine({
                    name: s.name,
                    series: s.series,
                    selected: this.plotIdx[i],
                    stepExtent: [toDate(this.stepExtent[0]), toDate(this.stepExtent[1])],
                    width: this.rowWidth,
                    onClick: onClick,
                    minLastValue: this.minLastValue,
                    maxLastValue: this.maxLastValue,
                    color: getColor(this.colorIndices[i]),
                }).render($)
            })
        })
    }
}
