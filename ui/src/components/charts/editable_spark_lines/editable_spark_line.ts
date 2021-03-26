import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue, SeriesModel} from "../../../models/run"
import {getBaseColor} from "../constants"
import {getExtent, getScale, getSelectedIdx} from "../utils"
import {LineFill, LinePlot} from "../lines/plot"
import {numberWithCommas, scientificFormat} from "../../../utils/value"
import Timeout = NodeJS.Timeout

export interface SparkLineOptions {
    name: string
    dynamic_type: string
    range: [number, number]
    series: PointValue[]
    sub: SeriesModel
    width: number
    stepExtent: [number, number]
    selected: number
    minLastValue: number
    maxLastValue: number
    onClick?: () => void
    onEdit: () => void
    isMouseMoveOpt?: boolean
    color: string
}

export class EditableSparkLine {
    name: string
    dynamic_type: string
    range: [number, number]
    series: PointValue[]
    sub: SeriesModel
    minLastValue: number
    maxLastValue: number
    color: string
    selected: number
    titleWidth: number
    chartWidth: number
    onClick?: () => void
    onEdit: () => void
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
    inputTimeout: Timeout

    constructor(opt: SparkLineOptions) {
        this.name = opt.name
        this.dynamic_type = opt.dynamic_type
        this.range = opt.range
        this.series = opt.series
        this.sub = opt.sub
        this.selected = opt.selected
        this.onClick = opt.onClick
        this.onEdit = opt.onEdit
        this.isMouseMoveOpt = opt.isMouseMoveOpt
        this.color = this.selected >= 0 ? opt.color : getBaseColor()
        this.titleWidth = Math.min(150, Math.round(opt.width * .35))
        this.chartWidth = opt.width - this.titleWidth * 2
        this.minLastValue = opt.minLastValue
        this.maxLastValue = opt.maxLastValue
        this.inputTimeout = null

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

    formatNumber(value: number) {
        if (value >= 10000 || value < 0.001) {
            return scientificFormat(value)
        }

        let decimals
        if (this.dynamic_type === 'float') {
            decimals = 3
        } else {
            decimals = 0
        }

        let str = value.toFixed(decimals)

        return numberWithCommas(str)
    }

    renderTextValue(cursorStep?: number | null) {
        const last = this.series[this.selected >= 0 || this.isMouseMoveOpt ?
            getSelectedIdx(this.series, this.bisect, cursorStep) : this.series.length - 1]

        this.primaryElem.textContent = this.formatNumber(last.value)
    }

    renderInputValue() {
        let s = this.sub ? this.sub.series : this.series
        const last = s[s.length - 1]
        this.inputValueElem.value = this.formatNumber(last.value)
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
                    $('span', `${this.dynamic_type}, range: [${this.range.toString()}]`, {style: {width: `${this.titleWidth}px`}})
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
        this.inputValueElem.addEventListener('keyup', this.debounceHandler.bind(this))

        this.updateSliderConfig()
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
        if (!isNaN(number)) {
            this.inputValueElem.value = this.formatNumber(number)
            this.lastChanged = number
            this.onEdit()
        }
    }

    debounceHandler() {
        clearTimeout(this.inputTimeout)
        this.inputTimeout = setTimeout(this.onInputChange.bind(this), 1000)
    }

    onInputChange() {
        let strNumber = this.inputValueElem.value

        let number = Number(strNumber)
        if (!isNaN(number)) {
            this.lastChanged = number
            this.onEdit()
        } else {
            confirm(`${strNumber} is not a number`)
            this.renderInputValue()
        }
    }

    updateSliderConfig(value?: number) {
        if (value === undefined) {
            let s = this.sub ? this.sub.series : this.series
            value = s[s.length - 1].value
        }

        this.inputRangeElem.setAttribute("max", `${value * (9 / 5)}`)
        this.inputRangeElem.setAttribute("step", `${value / 10}`)
        this.inputRangeElem.setAttribute("min", `${value / 5}`)
        this.inputRangeElem.setAttribute("value", `${value}`)
    }

    getInput() {
        return this.lastChanged
    }
}
