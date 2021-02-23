import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {getExtent, getScale, getTimeScale, toDate} from "../utils"
import d3 from "../../../d3"
import {RightAxis} from "../axis"
import {getColor} from "../constants"
import {Labels} from "../labels"
import ChartGradients from "../chart_gradients"
import {TimeSeriesFill, TimeSeriesPlot} from '../timeseries/plot';


export interface SimpleTimeSeriesOptions extends ChartOptions {
    onSelect?: (i: number) => void
    chartHeightFraction?: number
    yExtend?: [number, number]
    stepExtend?: [number, number]
    forceYStart?: number
    numTicks?: number
    onCursorMove?: ((cursorStep?: Date | null) => void)[]
    isCursorMoveOpt?: boolean
}

export class SimpleTimeLinesChart {
    series: SeriesModel[]
    chartWidth: number
    chartHeight: number
    margin: number
    axisSize: number
    labels: string[] = []
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>

    constructor(opt: SimpleTimeSeriesOptions) {
        this.series = opt.series

        this.axisSize = 30
        let windowWidth = opt.width
        this.margin = Math.floor(windowWidth / 64)
        this.chartWidth = windowWidth - 2 * this.margin - this.axisSize
        this.chartHeight = Math.round(this.chartWidth / 4)

        let plot: number[] = []
        for (let s of this.series) {
            plot.push(...s.value)
            this.labels.push(s.name)
        }

        const stepExtent = opt.stepExtend ? opt.stepExtend : getExtent(this.series.map(s => s.series), d => d.step)
        this.xScale = getTimeScale([toDate(stepExtent[0]), toDate(stepExtent[1])], this.chartWidth)
        this.yScale = getScale([Math.min(...plot), Math.max(...plot)], -this.chartHeight)
    }

    chartId = `chart_${Math.round(Math.random() * 1e9)}`

    render($: WeyaElementFunction) {
        if (this.series.length === 0) {
            $('div', '')
        } else {
            $('div', $ => {
                $('svg',
                    {
                        id: 'time-series-chart',
                        height: 2 * this.margin + this.axisSize + this.chartHeight,
                        width: 2 * this.margin + this.axisSize + this.chartWidth
                    },
                    $ => {
                        new ChartGradients().render($)
                        $('g',
                            {
                                transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                            },
                            $ => {
                                $('g', $ => {
                                    this.series.map((s, i) => {
                                        new TimeSeriesFill({
                                            series: s.series,
                                            xScale: this.xScale,
                                            yScale: this.yScale,
                                            color: getColor(i),
                                            colorIdx: i
                                        }).render($)
                                    })
                                    this.series.map((s, i) => {
                                        new TimeSeriesPlot({
                                            series: s.series,
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
