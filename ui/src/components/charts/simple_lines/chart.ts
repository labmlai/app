import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {getScale} from "../utils"
import d3 from "../../../d3"
import {SimpleLineFill, SimpleLinePlot} from "./plot"
import {RightAxis} from "../axis"
import {getColor} from "../constants"
import {Labels} from "../labels"

export class SimpleLinesChart {
    series: SeriesModel[]
    chartWidth: number
    chartHeight: number
    margin: number
    axisSize: number
    plot: number[] = []
    labels: string[] = []
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>

    constructor(opt: ChartOptions) {
        this.series = opt.series

        this.axisSize = 30
        let windowWidth = opt.width
        this.margin = Math.floor(windowWidth / 64)
        this.chartWidth = windowWidth - 2 * this.margin - this.axisSize
        this.chartHeight = Math.round(this.chartWidth / 4)

        for (let s of this.series) {
            this.plot.push(...s.value)
            this.labels.push(s.name)
        }

        this.xScale = getScale([0, this.series[0].value.length - 1], this.chartWidth, false)
        this.yScale = getScale([Math.min(...this.plot), Math.max(...this.plot)], -this.chartHeight)

    }

    chartId = `chart_${Math.round(Math.random() * 1e9)}`

    render($: WeyaElementFunction) {
        if (this.series.length === 0) {
            $('div', '')
        } else {
            $('div', $ => {
                $('svg',
                    {
                        id: 'chart',
                        height: 2 * this.margin + this.chartHeight,
                        width: 2 * this.margin + this.axisSize + this.chartWidth
                    },
                    $ => {
                        $('g',
                            {
                                transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                            },
                            $ => {
                                $('g', $ => {
                                    this.series.map((s, i) => {
                                        new SimpleLineFill({
                                            series: s.value,
                                            xScale: this.xScale,
                                            yScale: this.yScale,
                                            color: getColor(i),
                                            colorIdx: i
                                        }).render($)
                                    })
                                    this.series.map((s, i) => {
                                        new SimpleLinePlot({
                                            series: s.value,
                                            xScale: this.xScale,
                                            yScale: this.yScale,
                                            color: getColor(i)
                                        }).render($)
                                    })
                                })
                            })
                        $('g.right-axis',
                            {
                                transform: `translate(${this.margin + this.chartWidth}, ${this.margin + this.chartHeight})`
                            },
                            $ => {
                                new RightAxis({chartId: this.chartId, scale: this.yScale}).render($)
                            })
                    })
                new Labels({labels: this.labels}).render($)
            })
        }
    }
}