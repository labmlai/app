import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PlotOptions, FillOptions} from '../types'
import {PointValue} from "../../../models/run"


export interface LinePlotOptions extends PlotOptions {
    series: PointValue[]
}

export class LinePlot {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    smoothedLine
    unsmoothedLine

    constructor(opt: LinePlotOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color

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
        })
    }
}

interface LineFillOptions extends FillOptions {
    series: PointValue[]
}


export class LineFill {
    series: PointValue[]
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
                    // style: {fill: `url(#gradient-${this.colorIdx}`},
                    d: this.dFill
                })
        })
    }
}
