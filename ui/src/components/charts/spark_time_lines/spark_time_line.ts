import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PointValue} from "../../../models/run"
import {getBaseColor} from "../constants"
import {getExtent, getScale, getSelectedIdx, getTimeScale, toDate} from "../utils"
import {formatFixed} from "../../../utils/value"
import {TimeSeriesFill, TimeSeriesPlot} from '../timeseries/plot'

interface SparkTimeLineOptions {
    name: string
    series: PointValue[]
    width: number
    stepExtent: [Date, Date]
    selected: number
    minLastValue: number
    maxLastValue: number
    onClick?: () => void
    color: string
}

export class SparkTimeLine {
    series: PointValue[]
    name: string
    minLastValue: number
    maxLastValue: number
    color: string
    selected: number
    titleWidth: number
    chartWidth: number
    onClick?: () => void
    primaryElem: SVGTextElement
    secondaryElem: SVGTextElement
    className: string = 'empty'
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    bisect: d3.Bisector<number, number>
    timeSeriesPlot: TimeSeriesPlot

    constructor(opt: SparkTimeLineOptions) {
        this.series = opt.series
        this.name = opt.name
        this.selected = opt.selected
        this.onClick = opt.onClick
        this.color = this.selected >= 0 ? opt.color : getBaseColor()
        this.titleWidth = Math.min(150, Math.round(opt.width * .35))
        this.chartWidth = opt.width - this.titleWidth * 2
        this.minLastValue = opt.minLastValue
        this.maxLastValue = opt.maxLastValue

        this.yScale = getScale(getExtent([this.series], d => d.value, true), -25)
        this.xScale = getTimeScale(opt.stepExtent, this.chartWidth)

        this.bisect = d3.bisector(function (d: PointValue) {
            return toDate(d.step)
        }).left

        if (this.onClick != null && this.selected >= 0) {
            this.className = 'selected'
        }

        if (this.onClick != null) {
            this.className += '.list-group-item-action'
        }
    }

    changeCursorValue(cursorStep?: Date | null) {
        if (this.selected >= 0) {
            this.timeSeriesPlot.renderCursorCircle(cursorStep)
            this.renderValue(cursorStep)
        }
    }

    renderValue(cursorStep?: Date | null) {
        const last = this.series[this.selected >= 0 ? getSelectedIdx(this.series, this.bisect, cursorStep)
            : this.series.length - 1]

        if (Math.abs(last.value - last.smoothed) > Math.abs(last.value) / 1e6) {
            this.secondaryElem.textContent = formatFixed(last.value, 6)
        } else {
            this.secondaryElem.textContent = ''
        }
        this.primaryElem.textContent = formatFixed(last.smoothed, 6)
    }

    render($: WeyaElementFunction) {
        $(`div.sparkline-list-item.list-group-item.${this.className}`, {on: {click: this.onClick}}, $ => {
            $('div.sparkline-content', {style: {width: `${this.titleWidth * 2 + this.chartWidth}px`}}, $ => {
                $('span', this.name, {style: {width: `${this.titleWidth}px`, color: this.color}})
                $('svg.sparkline', {style: {width: `${this.chartWidth + this.titleWidth}px`}, height: 36}, $ => {
                    $('g', {transform: `translate(${0}, 30)`}, $ => {
                        new TimeSeriesFill({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d',
                            colorIdx: 9
                        }).render($)
                        this.timeSeriesPlot = new TimeSeriesPlot({
                            series: this.series,
                            xScale: this.xScale,
                            yScale: this.yScale,
                            color: '#7f8c8d'
                        })
                        this.timeSeriesPlot.render($)
                    })
                    $('g', {transform: `translate(${this.titleWidth}, ${0})`}, $ => {
                        this.secondaryElem = $('text', '.value-secondary', {
                            style: {fill: this.color},
                            transform: `translate(${this.chartWidth},${12})`
                        })
                        this.primaryElem = $('text', '.value-primary', {
                            style: {fill: this.color},
                            transform: `translate(${this.chartWidth},${29})`
                        })
                    })
                })
            })
        })

        this.renderValue()
    }
}
