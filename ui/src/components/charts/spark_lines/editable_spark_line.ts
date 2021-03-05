import d3 from "../../../d3"
import {Weya as $, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {getExtent, getScale} from "../utils"
import {LineFill, LinePlot} from "../lines/plot"
import {SparkLineOptions} from "./spark_line"
import {formatFixed} from "../../../utils/value"

interface EditableSparkLineOptions extends SparkLineOptions {
}

export class EditableSparkLine {
    series: PointValue[]
    name: string
    color: string
    titleWidth: number
    chartWidth: number
    valueElem: HTMLSpanElement
    inputElem: HTMLInputElement
    className: string = 'empty'
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    linePlot: LinePlot

    constructor(opt: EditableSparkLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.titleWidth = Math.min(150, Math.round(opt.width * .375))
        this.chartWidth = opt.width - this.titleWidth * 2

        this.yScale = getScale(getExtent([this.series], d => d.value, true), -25)
        this.xScale = getScale(opt.stepExtent, this.chartWidth)
    }

    renderValue() {
        const last = this.series[this.series.length - 1]

        this.valueElem.innerHTML = ''
        $(this.valueElem, $ => {
            $('span.input-content', $ => {
                this.inputElem = <HTMLInputElement>$('input', {
                        value: formatFixed(last.smoothed, 4),
                        type: "number"
                    }
                )
            })
        })
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item.${this.className}`, $ => {
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
                        this.linePlot = new LinePlot({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d'
                        })
                        this.linePlot.render($)
                    })
                })
                this.valueElem = <HTMLSpanElement>$('span.input-container.value', {style: {width: `${this.titleWidth}px`}})
            })
        })

        this.renderValue()
    }

    getInput() {
        return this.inputElem.value
    }
}
