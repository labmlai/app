import d3 from "../../../d3"
import {Weya as $, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {FillOptions, PlotOptions} from '../types'
import {PointValue} from "../../../models/run"
import {getSelectedIdx} from "../utils"


export interface LinePlotOptions extends PlotOptions {
    xScale: d3.ScaleLinear<number, number>
    series: PointValue[]
}

export class LinePlot {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    circleContainer: WeyaElement
    smoothedLine: d3.Line<PointValue>
    unsmoothedLine: d3.Line<PointValue>
    bisect: d3.Bisector<number, number>

    constructor(opt: LinePlotOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color

        this.bisect = d3.bisector(function (d: PointValue) {
            return d.step
        }).left

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(d.step)
            })
            .y((d) => {
                return this.yScale(d.smoothed)
            })

        this.unsmoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(d.step)
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

    renderCursorCircle(cursorStep: number | null) {
        if (cursorStep != null) {
            let idx = getSelectedIdx(this.series, this.bisect, cursorStep)

            this.circleContainer.innerHTML = ''
            $(this.circleContainer, $ => {
                $('circle',
                    {
                        r: 5,
                        cx: this.xScale(this.series[idx].step),
                        cy: this.yScale(this.series[idx].smoothed),
                        fill: this.color
                    })
            })
        }
    }
}

interface LineFillOptions extends FillOptions {
    xScale: d3.ScaleLinear<number, number>
    series: PointValue[]
    chartId: string
}


export class LineFill {
    series: PointValue[]
    chartId: string
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    colorIdx: number
    smoothedLine
    dFill: string

    constructor(opt: LineFillOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color
        this.colorIdx = opt.colorIdx
        this.chartId = opt.chartId

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(d.step)
            })
            .y((d) => {
                return this.yScale(d.smoothed)
            })

        let d = this.smoothedLine(this.series) as string
        this.dFill = `M${this.xScale(this.series[0].step)},0L` + d.substr(1) +
            `L${this.xScale(this.series[this.series.length - 1].step)},0`
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
