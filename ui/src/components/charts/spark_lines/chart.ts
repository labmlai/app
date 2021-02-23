import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {getExtent} from "../utils"
import {SparkLine} from "./spark_line"
import {getColor} from "../constants"


interface SparkLinesOptions extends ChartOptions {
    plotIdx: number[]
    onSelect?: (i: number) => void
}

export class SparkLines {
    series: SeriesModel[]
    plotIdx: number[]
    rowWidth: number
    minLastValue: number
    maxLastValue: number
    stepExtent: [number, number]
    colorIndices: number[] = []
    onSelect?: (i: number) => void
    sparkLines: SparkLine[] = []

    constructor(opt: SparkLinesOptions) {
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

    changeCursorValues = (cursorStep?: number | null) => {
        for (let sparkLine of this.sparkLines) {
            sparkLine.changeCursorValue(cursorStep)
        }
    }

    render($: WeyaElementFunction) {
        $('div.sparkline-list.list-group', $ => {
            this.series.map((s, i) => {
                let onClick
                if (this.onSelect != null) {
                    onClick = this.onSelect.bind(null, i)
                }
                let sparkLine = new SparkLine({
                    name: s.name,
                    series: s.series,
                    selected: this.plotIdx[i],
                    stepExtent: this.stepExtent,
                    width: this.rowWidth,
                    onClick: onClick,
                    minLastValue: this.minLastValue,
                    maxLastValue: this.maxLastValue,
                    color: getColor(this.colorIndices[i]),
                })
                this.sparkLines.push(sparkLine)
                sparkLine.render($)
            })
        })
    }
}