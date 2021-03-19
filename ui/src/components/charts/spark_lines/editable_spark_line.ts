import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {getBaseColor} from "../constants"
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
    className: string = 'empty'
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    bisect: d3.Bisector<number, number>
    linePlot: LinePlot
    inputRangeElem: HTMLInputElement
    inputValueElem: HTMLInputElement
    inputElements: HTMLDivElement
    primaryElem: SVGTextElement
    lastChanged: number

    constructor(opt: SparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.selected = opt.selected
        this.onClick = opt.onClick
        this.isMouseMoveOpt = opt.isMouseMoveOpt
        this.color = this.selected >= 0 ? opt.color : getBaseColor()
        this.titleWidth = Math.min(150, Math.round(opt.width * .35))
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
            this.renderTextValue(cursorStep)
        }
    }

    renderTextValue(cursorStep?: number | null) {
        const last = this.series[this.selected >= 0 || this.isMouseMoveOpt ?
            getSelectedIdx(this.series, this.bisect, cursorStep) : this.series.length - 1]

        this.primaryElem.textContent = formatFixed(last.smoothed, 3)
    }

    renderInputValue() {
        const last = this.series[this.series.length - 1]
        this.inputValueElem.value = formatFixed(last.smoothed, 3)
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item.${this.className}`, {on: {click: this.onClick}}, $ => {
            $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                $('span', this.name, {style: {width: `${this.titleWidth}px`, color: this.color}})
                $('svg.sparkline', {style: {width: `${this.chartWidth + this.titleWidth}px`}, height: 36}, $ => {
                    $('g', {transform: `translate(${0}, 30)`}, $ => {
                        new LineFill({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d',
                            colorIdx: 9
                        }).render($)
                        this.linePlot = new LinePlot({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d'
                        })
                        this.linePlot.render($)
                    })
                    $('g', {transform: `translate(${this.titleWidth}, ${0})`}, $ => {
                        this.primaryElem = $('text', '.value-primary', {
                            style: {fill: this.color},
                            transform: `translate(${this.chartWidth},${29})`
                        })
                    })
                })
                this.inputElements = $('div', '.mt-1', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                    $('span', '', {style: {width: `${this.titleWidth}px`, color: this.color}})
                    this.inputRangeElem = $('input', '.slider', {
                        type: "range",
                        style: {width: `${this.chartWidth}px`},
                    })
                    $('span.input-container', {style: {width: `${this.titleWidth}px`}}, $ => {
                        $('span.input-content.float-right', $ => {
                            this.inputValueElem = $('input', '.text-end', {
                                style: {
                                    height: '36px',
                                    width: `${this.titleWidth / 2}px`,
                                    padding: '0px'
                                }
                            })
                        })
                    })
                })
            })
        })

        this.inputRangeElem.addEventListener('click', this.onInputElemClick.bind(this))
        this.inputValueElem.addEventListener('click', this.onInputElemClick.bind(this))
        this.inputRangeElem.addEventListener('input', this.onSliderChange.bind(this))
        this.inputValueElem.addEventListener('input', this.onInputChange.bind(this))

        const last = this.series[this.series.length - 1]
        this.lastChanged = last.smoothed
        this.updateSliderConfig(last.smoothed)

        this.renderInputValue()
        this.renderTextValue()

        if (this.className.includes('selected')) {
            this.inputElements.style.display = 'block'
        } else {
            this.inputElements.style.display = 'none'
        }
    }

    onInputElemClick(e: Event) {
        e.preventDefault()
        e.stopPropagation()
    }

    onSliderChange() {
        let number = Number(this.inputRangeElem.value)
        if (number) {
            this.inputValueElem.value = formatFixed(number, 3)
            this.lastChanged = number
        }
    }

    onInputChange() {
        let number = Number(this.inputValueElem.value)
        if (number) {
            this.lastChanged = number
            // this.updateSliderConfig(number)
        }
    }

    updateSliderConfig(value: number) {
        this.inputRangeElem.setAttribute("max", `${value * (9 / 5)}`)
        this.inputRangeElem.setAttribute("step", `${value / 10}`)
        this.inputRangeElem.setAttribute("min", `${value / 5}`)
        this.inputRangeElem.setAttribute("value", `${value}`)
    }

    getInput() {
        return this.lastChanged
    }
}
