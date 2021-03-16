import d3 from "../../../d3"
import {WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {BASE_COLOR} from "../constants"
import {getExtent, getScale, getSelectedIdx} from "../utils"
import {LineFill, LinePlot} from "../lines/plot"
import {formatFixed} from "../../../utils/value"

export interface SparkLineOptions {
    name: string
    series: PointValue[]
    width: number
    stepExtent: [number, number]
    selected: number
    minLastValue: number
    maxLastValue: number
    onClick?: () => void
    isMouseMoveOpt?: boolean
    color: string
}

export class EditableSparkLine {
    series: PointValue[]
    name: string
    minLastValue: number
    maxLastValue: number
    color: string
    selected: number
    titleWidth: number
    chartWidth: number
    onClick?: () => void
    isMouseMoveOpt?: boolean
    primaryElem: WeyaElement
    className: string = 'empty'
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    bisect: d3.Bisector<number, number>
    linePlot: LinePlot
    inputRangeElem: HTMLInputElement
    inputValueElem: HTMLInputElement

    constructor(opt: SparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.selected = opt.selected
        this.onClick = opt.onClick
        this.isMouseMoveOpt = opt.isMouseMoveOpt
        this.color = this.selected >= 0 ? opt.color : BASE_COLOR
        this.titleWidth = Math.min(150, Math.round(opt.width * .375))
        this.chartWidth = opt.width - this.titleWidth * 2
        this.minLastValue = opt.minLastValue
        this.maxLastValue = opt.maxLastValue

        this.yScale = getScale(getExtent([this.series], d => d.value, true), -25)
        this.xScale = getScale(opt.stepExtent, this.chartWidth)

        this.bisect = d3.bisector(function (d: PointValue) {
            return d.step
        }).left

        if (this.onClick != null && this.selected >= 0) {
            this.className = 'selected'
        }

        if (this.onClick != null) {
            this.className += '.list-group-item-action'
        }
    }

    changeCursorValue(cursorStep?: number | null) {
        if (this.selected >= 0) {
            this.linePlot.renderCursorCircle(cursorStep)
            this.renderStepValue(cursorStep)
        }
    }

    renderStepValue(cursorStep?: number | null) {
        const last = this.series[this.selected >= 0 || this.isMouseMoveOpt ?
            getSelectedIdx(this.series, this.bisect, cursorStep) : this.series.length - 1]

        this.inputValueElem.value = formatFixed(last.smoothed, 6)
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item.${this.className}`, $ => {
            $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                $('span', this.name, {style: {width: `${this.titleWidth}px`, color: this.color}})
                // $('svg.sparkline', {style: {width: `${this.chartWidth}px`}, height: 25}, $ => {
                //     $('g', {transform: `translate(${0}, 25)`}, $ => {
                //         new LineFill({
                //             series: this.series,
                //             xScale: this.xScale,
                //             yScale: this.yScale,
                //             color: '#7f8c8d',
                //             colorIdx: 9
                //         }).render($)
                //         this.linePlot = new LinePlot({
                //             series: this.series,
                //             xScale: this.xScale,
                //             yScale: this.yScale,
                //             color: '#7f8c8d'
                //         })
                //         this.linePlot.render($)
                //     })
                // })
                this.inputRangeElem = $('input', '.form-range', {
                    type: "range",
                    style: {width: `${this.chartWidth}px`},

                })
                $('span.input-container', {style: {width: `${this.titleWidth}px`}}, $ => {
                    $('span.input-content.float-right', {style: {width: `${this.titleWidth / 1.5}px`}}, $ => {
                        this.inputValueElem = $('input', {style: {height: '36px', color: this.color}})
                    })
                })
            })
        })

        this.inputRangeElem.addEventListener('input', this.onSliderChange.bind(this))
        this.inputValueElem.addEventListener('input', this.onInputChange.bind(this))

        const last = this.series[this.series.length - 1]
        this.updateSliderConfig(last.smoothed)

        this.renderStepValue()
    }

    updateSliderConfig(value: number) {
        this.inputRangeElem.setAttribute("max", `${value * 10}`)
        this.inputRangeElem.setAttribute("step", `${value / 10}`)
        this.inputRangeElem.setAttribute("min", `${value / 10}`)
        this.inputRangeElem.setAttribute("value", `${value}`)
    }

    onSliderChange() {
        let value = this.inputRangeElem.value
        this.inputValueElem.value = formatFixed(parseFloat(value), 6)
    }

    onInputChange() {
        let number = Number(this.inputValueElem.value)
        if (number) {
            this.inputRangeElem.setAttribute("value", `${number}`)
            this.updateSliderConfig(number)
        }
    }

    getInput() {
        return this.inputRangeElem.value
    }
}
