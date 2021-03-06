import d3 from "../../../d3"
import {Weya as $, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {FillOptions, PlotOptions} from '../types'
import {PointValue} from "../../../models/run"
import {getSelectedIdx, toDate} from "../utils"


export interface TimeSeriesOptions extends PlotOptions {
    xScale: d3.ScaleTime<number, number>
    series: PointValue[]
}

export class TimeSeriesPlot {
    series: PointValue[]
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    circleContainer: WeyaElement
    smoothedLine: d3.Line<PointValue>
    unsmoothedLine: d3.Line<PointValue>
    bisect: d3.Bisector<number, number>

    constructor(opt: TimeSeriesOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color

        this.bisect = d3.bisector(function (d: PointValue) {
            return toDate(d.step)
        }).left

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(toDate(d.step))
            })
            .y((d) => {
                return this.yScale(d.smoothed)
            })

        this.unsmoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(toDate(d.step))
            })
            .y((d) => {
                return this.yScale(d.value)
            })
    }

    render($: WeyaElementFunction) {
        $('g', $ => {
            $('path.smoothed-line.dropshadow',
                {
                    fill: 'none',
                    stroke: this.color,
                    d: this.smoothedLine(this.series) as string
                })
            $('path.unsmoothed-line',
                {
                    fill: 'none',
                    stroke: this.color,
                    d: this.unsmoothedLine(this.series) as string
                })
            this.circleContainer = $('g')
        })
    }

    renderCursorCircle(cursorStep: Date | null) {
        if (cursorStep != null) {
            let idx = getSelectedIdx(this.series, this.bisect, cursorStep)

            this.circleContainer.innerHTML = ''
            $(this.circleContainer, $ => {
                $('circle',
                    {
                        r: 5,
                        cx: this.xScale(toDate(this.series[idx].step)),
                        cy: this.yScale(this.series[idx].smoothed),
                        fill: this.color
                    })
            })
        }
    }
}

interface TimeSeriesFillOptions extends FillOptions {
    xScale: d3.ScaleTime<number, number>
    series: PointValue[]
    chartId: string
}


export class TimeSeriesFill {
    series: PointValue[]
    chartId: string
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    colorIdx: number
    smoothedLine
    dFill: string

    constructor(opt: TimeSeriesFillOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color
        this.colorIdx = opt.colorIdx
        this.chartId = opt.chartId

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(toDate(d.step))
            })
            .y((d) => {
                return this.yScale(d.smoothed)
            })

        let d = this.smoothedLine(this.series) as string
        this.dFill = `M${this.xScale(toDate(this.series[0].step))},0L` + d.substr(1) +
            `L${this.xScale(toDate(this.series[this.series.length - 1].step))},0`
    }

    render($: WeyaElementFunction) {
        $('g', $ => {
            $('path.line-fill',
                {
                    fill: this.color,
                    stroke: 'none',
                    style: {fill: `url(#gradient-${this.colorIdx}-${this.chartId}`},
                    d: this.dFill
                })
        })
    }
}
