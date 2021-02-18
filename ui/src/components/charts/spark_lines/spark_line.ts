import d3 from "../../../d3"
import {Weya as $, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {BASE_COLOR} from "../constants"
import {getExtent, getScale} from "../utils"
import {LineFill, LinePlot} from "../lines/plot"
import {formatFixed, pickHex, scaleValue} from "../../../utils/value"

interface SparkLineOptions {
    name: string
    series: PointValue[]
    width: number
    stepExtent: [number, number]
    selected: number
    minLastValue: number
    maxLastValue: number
    onClick?: () => void
    color: string
}

export class SparkLine {
    series: PointValue[]
    name: string
    minLastValue: number
    maxLastValue: number
    color: string
    selected: number
    titleWidth: number
    chartWidth: number
    onClick?: () => void
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    valueElem: HTMLSpanElement
    className: string = 'empty'

    constructor(opt: SparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.selected = opt.selected
        this.onClick = opt.onClick
        this.color = this.selected >= 0 ? opt.color : BASE_COLOR
        this.titleWidth = Math.min(150, Math.round(opt.width * .375))
        this.chartWidth = opt.width - this.titleWidth * 2
        this.minLastValue = opt.minLastValue
        this.maxLastValue = opt.maxLastValue

        this.yScale = getScale(getExtent([this.series], d => d.value, true), -25)
        this.xScale = getScale(opt.stepExtent, this.chartWidth)

        if (this.onClick != null && this.selected >= 0) {
            this.className = 'selected'
        }
    }

    renderValue() {
        const last = this.series[this.series.length - 1]

        let lastValue = scaleValue(last.value, this.minLastValue, this.maxLastValue)
        let valueColor = pickHex(lastValue)

        if (Math.abs(last.value - last.smoothed) > Math.abs(last.value) / 1e6) {
            $(this.valueElem, $ => {
                $('span.value-secondary', formatFixed(last.value, 6), {style: {color: valueColor}})
                $('span.value-primary', formatFixed(last.smoothed, 6), {style: {color: valueColor}})
            })
        } else {
            this.valueElem.classList.add('primary-only')
            $(this.valueElem, $ => {
                $('span.value-primary', formatFixed(last.smoothed, 6), {style: {color: valueColor}})
            })
        }
    }

    render($: WeyaElementFunction) {
            $(`div.sparkline-list-item.list-group-item.list-group-item-action.${this.className}`, {on: {click: this.onClick}}, $ => {
                $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                    $('span', this.name, {style: {width: `${this.titleWidth}px`, color: this.color}})
                    $('svg.sparkline', {style: {width: `${this.chartWidth}px`}, height: 25}, $ => {
                        $('g', {transform: `translate(${0}, 25)`}, $ => {
                            new LineFill({
                                series: this.series,
                                xScale: this.xScale,
                                yScale: this.yScale,
                                color: '#7f8c8d',
                                colorIdx: 9
                            }).render($)
                            new LinePlot({
                                series: this.series,
                                xScale: this.xScale,
                                yScale: this.yScale,
                                color: '#7f8c8d'
                            }).render($)
                        })
                    })
                    this.valueElem = <HTMLSpanElement>$('span.value', {style: {width: `${this.titleWidth}px`}})
                })
            })

        this.renderValue()
    }
}