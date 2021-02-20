import d3 from "../../../d3"
import {WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ChartOptions} from '../types'
import {SeriesModel} from "../../../models/run"
import {getScale, toPointValues, getLogScale, getExtent, defaultSeriesToPlot} from "../utils"
import {LineFill, LinePlot} from "./plot"
import {getColor} from "../constants"
import {RightAxis, BottomAxis} from "../axis"
import {CHART_COLORS} from "../constants"


interface LineChartOptions extends ChartOptions {
    plotIdx: number[]
    onSelect?: (i: number) => void
    chartType: string
}

export class LineChart {
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
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    svgElem: WeyaElement
    linePlots: LinePlot[] = []

    constructor(opt: LineChartOptions) {
        this.series = toPointValues(opt.series)
        this.chartType = opt.chartType
        this.plotIdx = opt.plotIdx

        this.axisSize = 30
        let windowWidth = opt.width
        this.margin = Math.floor(windowWidth / 64)
        this.chartWidth = windowWidth - 2 * this.margin - this.axisSize
        this.chartHeight = Math.round(this.chartWidth / 2)

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

        const stepExtent = getExtent(this.series.map(s => s.series), d => d.step)
        this.xScale = getScale(stepExtent, this.chartWidth, false)
    }

    chartId = `chart_${Math.round(Math.random() * 1e9)}`

    changeScale() {
        let plotSeries = this.plot.map(s => s.series)

        if (this.chartType === 'log') {
            this.yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -this.chartHeight)
        } else {
            this.yScale = getScale(getExtent(plotSeries, d => d.value, false), -this.chartHeight)
        }
    }

    updateCursorStep(ev: any) {
        let cursorStep: number = null
        let clientX = ev.clientX

        if (clientX) {
            const clientLeft = this.svgElem.clientLeft
            let currentX = this.xScale.invert(clientX - clientLeft - this.margin)
            if (currentX > 0) {
                cursorStep = currentX
            }
        }

        for (let linePlot of this.linePlots) {
            linePlot.renderCursorCircle(cursorStep)
        }
    }

    render($: WeyaElementFunction) {
        this.changeScale()

        if (this.series.length === 0) {
            $('div', '')
        } else {
            $('div', $ => {
                $('div', $ => {
                        this.svgElem = $('svg',
                            {
                                id: 'chart',
                                height: 2 * this.margin + this.axisSize + this.chartHeight,
                                width: 2 * this.margin + this.axisSize + this.chartWidth,
                                on: {mousemove: this.updateCursorStep.bind(this)}
                            }, $ => {
                                $('g',
                                    {
                                        transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                                    }, $ => {
                                        if (this.plot.length < 3) {
                                            this.plot.map((s, i) => {
                                                new LineFill({
                                                    series: s.series,
                                                    xScale: this.xScale,
                                                    yScale: this.yScale,
                                                    color: getColor(this.filteredPlotIdx[i]),
                                                    colorIdx: this.filteredPlotIdx[i] % CHART_COLORS.length
                                                }).render($)
                                            })
                                        }
                                        this.plot.map((s, i) => {
                                            let linePlot = new LinePlot({
                                                series: s.series,
                                                xScale: this.xScale,
                                                yScale: this.yScale,
                                                color: getColor(this.filteredPlotIdx[i])
                                            })
                                            this.linePlots.push(linePlot)
                                            linePlot.render($)
                                        })
                                    })
                                $('g.bottom-axis',
                                    {
                                        transform: `translate(${this.margin}, ${this.margin + this.chartHeight})`
                                    },
                                    $ => {
                                        new BottomAxis({chartId: this.chartId, scale: this.xScale}).render($)
                                    })
                                $('g.right-axis',
                                    {
                                        transform: `translate(${this.margin + this.chartWidth}, ${this.margin + this.chartHeight})`
                                    }, $ => {
                                        new RightAxis({chartId: this.chartId, scale: this.yScale}).render($)
                                    })
                            })
                    }
                )
            })
        }
    }
}