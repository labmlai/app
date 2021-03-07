import d3 from "../../../d3"
import {Weya as $, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {defaultSeriesToPlot, getExtent, getLogScale, getScale, getTimeScale, toDate} from "../utils"
import {BottomTimeAxis, RightAxis} from "../axis"
import {TimeSeriesFill, TimeSeriesPlot} from './plot'
import {formatDateTime} from '../../../utils/time'
import {DropShadow, LineGradients} from "../chart_gradients"
import ChartColors from "../chart_colors"


export interface TimeSeriesOptions extends ChartOptions {
    plotIdx: number[]
    onSelect?: (i: number) => void
    chartHeightFraction?: number
    yExtend?: [number, number]
    stepExtend?: [number, number]
    forceYStart?: number
    numTicks?: number
    onCursorMove?: ((cursorStep?: Date | null) => void)[]
    isCursorMoveOpt?: boolean
    isDivergent?: boolean
}

export class TimeSeriesChart {
    series: SeriesModel[]
    plotIdx: number[]
    plot: SeriesModel[] = []
    filteredPlotIdx: number[] = []
    chartType: string
    chartWidth: number
    chartHeight: number
    margin: number
    axisSize: number
    labels: string[] = []
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    yExtend?: [number, number]
    forceYStart?: number
    svgElem: WeyaElement
    stepContainer: WeyaElement
    timeSeriesPlots: TimeSeriesPlot[] = []
    numTicks?: number
    onCursorMove?: ((cursorStep?: Date | null) => void)[]
    isCursorMoveOpt?: boolean
    chartColors: ChartColors
    isDivergent: boolean

    constructor(opt: TimeSeriesOptions) {
        this.series = opt.series
        this.plotIdx = opt.plotIdx
        this.yExtend = opt.yExtend
        this.forceYStart = opt.forceYStart
        this.numTicks = opt.numTicks
        this.onCursorMove = opt.onCursorMove ? opt.onCursorMove : []
        this.isCursorMoveOpt = opt.isCursorMoveOpt

        this.axisSize = 30
        let windowWidth = opt.width
        this.margin = Math.floor(windowWidth / 64)
        this.chartWidth = windowWidth - 2 * this.margin - this.axisSize
        this.chartHeight = Math.round(this.chartWidth / 2)
        if (opt.chartHeightFraction) {
            this.chartHeight /= opt.chartHeightFraction
        }

        if (this.plotIdx.length === 0) {
            this.plotIdx = defaultSeriesToPlot(this.series)
        }

        for (let i = 0; i < this.plotIdx.length; i++) {
            if (this.plotIdx[i] >= 0) {
                this.filteredPlotIdx.push(i)
                this.plot.push(this.series[i])
            }
        }
        if (this.plotIdx.length > 0 && Math.max(...this.plotIdx) < 0) {
            this.plot = [this.series[0]]
            this.filteredPlotIdx = [0]
        }


        const stepExtent = opt.stepExtend ? opt.stepExtend : getExtent(this.series.map(s => s.series), d => d.step)
        this.xScale = getTimeScale([toDate(stepExtent[0]), toDate(stepExtent[1])], this.chartWidth)

        this.chartColors = new ChartColors({nColors: this.series.length, isDivergent: opt.isDivergent})
    }

    chartId = `chart_${Math.round(Math.random() * 1e9)}`

    changeScale() {
        let plotSeries = this.plot.map(s => s.series)
        this.yExtend = this.yExtend || getExtent(plotSeries, d => d.value, false)
        if (this.forceYStart) {
            this.yExtend[0] = this.forceYStart
        }

        if (this.chartType === 'log') {
            this.yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -this.chartHeight)
        } else {
            this.yScale = getScale(this.yExtend, -this.chartHeight)
        }
    }

    updateCursorStep(ev: TouchEvent | MouseEvent) {
        let cursorStep: Date = null
        let clientX = ev instanceof TouchEvent ? ev.touches[0].clientX : ev.clientX

        if (clientX) {
            const info = this.svgElem.getBoundingClientRect()
            let currentX = this.xScale.invert(clientX - info.left - this.margin)

            cursorStep = currentX
        }

        this.renderStep(cursorStep)
        for (let timeSeriesPlot of this.timeSeriesPlots) {
            timeSeriesPlot.renderCursorCircle(cursorStep)
        }
        for (let func of this.onCursorMove) {
            func(cursorStep)
        }
    }

    renderStep(cursorStep: Date) {
        this.stepContainer.innerHTML = ''
        $(this.stepContainer, $ => {
            $('h6.text-center.selected-step', formatDateTime(cursorStep))
        })
    }

    render($: WeyaElementFunction) {
        this.changeScale()

        if (this.series.length === 0) {
            $('div', '')
        } else {
            $('div', $ => {
                $('div', $ => {
                        this.stepContainer = $('div')
                        this.svgElem = $('svg', '#time-series-chart',
                            {
                                height: 2 * this.margin + this.axisSize + this.chartHeight,
                                width: 2 * this.margin + this.axisSize + this.chartWidth,
                            }, $ => {
                                new DropShadow().render($)
                                new LineGradients({chartColors: this.chartColors, chartId: this.chartId}).render($)
                                $('g',
                                    {
                                        transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                                    }, $ => {
                                        if (this.plot.length < 3) {
                                            this.plot.map((s, i) => {
                                                new TimeSeriesFill({
                                                    series: s.series,
                                                    xScale: this.xScale,
                                                    yScale: this.yScale,
                                                    color: this.chartColors.getColor(this.filteredPlotIdx[i]),
                                                    colorIdx: this.filteredPlotIdx[i] % this.chartColors.getColors().length,
                                                    chartId: this.chartId
                                                }).render($)
                                            })
                                        }
                                        this.plot.map((s, i) => {
                                            let timeSeriesPlot = new TimeSeriesPlot({
                                                series: s.series,
                                                xScale: this.xScale,
                                                yScale: this.yScale,
                                                color: this.chartColors.getColor(this.filteredPlotIdx[i])
                                            })
                                            this.timeSeriesPlots.push(timeSeriesPlot)
                                            timeSeriesPlot.render($)
                                        })
                                    })
                                $('g.bottom-axis',
                                    {
                                        transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                                    },
                                    $ => {
                                        new BottomTimeAxis({chartId: this.chartId, scale: this.xScale}).render($)
                                    })
                                $('g.right-axis',
                                    {
                                        transform: `translate(${this.margin + this.chartWidth}, ${this.margin + this.chartHeight})`
                                    }, $ => {
                                        new RightAxis({
                                            chartId: this.chartId,
                                            scale: this.yScale,
                                            specifier: '.1s',
                                            numTicks: 3
                                        }).render($)
                                    })
                            })
                    }
                )
            })
            if (this.isCursorMoveOpt) {
                this.svgElem.addEventListener('touchmove', this.updateCursorStep.bind(this))
                this.svgElem.addEventListener('touchstart', this.updateCursorStep.bind(this))
                this.svgElem.addEventListener('mousemove', this.updateCursorStep.bind(this))
            }
        }
    }
}
