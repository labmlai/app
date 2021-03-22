import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {defaultSeriesToPlot, getExtent, toPointValues} from "../utils"
import {SparkLine} from "../spark_lines/spark_line"
import {EditableSparkLine} from "./editable_spark_line"
import ChartColors from "../chart_colors"


interface SparkLinesOptions extends ChartOptions {
    plotIdx: number[]
    onSelect?: (i: number) => void
    onEdit: () => void
    isEditable: boolean
    isMouseMoveOpt?: boolean
    isDivergent?: boolean
}

export class EditableSparkLines {
    series: SeriesModel[]
    plotIdx: number[]
    isEditable: boolean
    rowWidth: number
    minLastValue: number
    maxLastValue: number
    isMouseMoveOpt: boolean
    stepExtent: [number, number]
    colorIndices: number[] = []
    onSelect?: (i: number) => void
    onEdit: () => void
    sparkLines: SparkLine[] = []
    editableSparkLines: EditableSparkLine[] = []
    chartColors: ChartColors
    isDivergent?: boolean
    editablePlots: SeriesModel[] = []

    constructor(opt: SparkLinesOptions) {
        this.series = opt.series
        this.plotIdx = opt.plotIdx
        this.onSelect = opt.onSelect
        this.onEdit = opt.onEdit
        this.isEditable = opt.isEditable
        this.isMouseMoveOpt = opt.isMouseMoveOpt

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

        if (this.plotIdx.length === 0) {
            this.plotIdx = defaultSeriesToPlot(this.series)
        }

        for (let i = 0; i < this.plotIdx.length; i++) {
            if (this.plotIdx[i] >= 0) {
                this.colorIndices.push(i)

                let s = this.series[i]
                if (s.sub) {
                    this.editablePlots.push(s.sub)
                }
            } else {
                this.colorIndices.push(-1)
            }
        }

        this.editablePlots = toPointValues(this.editablePlots)
        this.chartColors = new ChartColors({nColors: this.series.length, isDivergent: opt.isDivergent})
    }

    changeCursorValues = (cursorStep?: number | null) => {
        for (let sparkLine of this.sparkLines) {
            sparkLine.changeCursorValue(cursorStep)
        }

        if (this.isEditable) {
            for (let sparkLine of this.editableSparkLines) {
                sparkLine.changeCursorValue(cursorStep)
            }
        }
    }

    getSparkLinesValues() {
        let res = {}
        for (let sparkLine of this.editableSparkLines) {
            res[sparkLine.name] = sparkLine.getInput()
        }

        return res
    }

    render($: WeyaElementFunction) {
        $('div.sparkline-list.list-group', $ => {
            let editablePlotIdx = 0
            this.series.map((s, i) => {
                let onClick
                if (this.onSelect != null) {
                    onClick = this.onSelect.bind(null, i)
                }
                if (this.isEditable && s.is_editable) {
                    let editable = this.editablePlots[editablePlotIdx] ? this.editablePlots[editablePlotIdx] : s
                    let editableSparkLine = new EditableSparkLine({
                        name: s.name,
                        series: editable.series,
                        selected: this.plotIdx[i],
                        stepExtent: this.stepExtent,
                        width: this.rowWidth,
                        onClick: onClick,
                        minLastValue: this.minLastValue,
                        maxLastValue: this.maxLastValue,
                        color: this.chartColors.getColor(this.colorIndices[i]),
                        isMouseMoveOpt: this.isMouseMoveOpt,
                        onEdit: this.onEdit
                    })
                    this.editableSparkLines.push(editableSparkLine)
                    editableSparkLine.render($)

                    editablePlotIdx++
                } else {
                    let sparkLine = new SparkLine({
                        name: s.name,
                        series: s.series,
                        selected: this.plotIdx[i],
                        stepExtent: this.stepExtent,
                        width: this.rowWidth,
                        onClick: onClick,
                        minLastValue: this.minLastValue,
                        maxLastValue: this.maxLastValue,
                        color: this.chartColors.getColor(this.colorIndices[i]),
                        isMouseMoveOpt: this.isMouseMoveOpt
                    })
                    this.sparkLines.push(sparkLine)
                    sparkLine.render($)
                }
            })
        })
    }
}