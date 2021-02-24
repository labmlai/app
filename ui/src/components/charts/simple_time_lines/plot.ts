import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {FillOptions, PlotOptions} from '../types'

interface SimpleTimeLinePlotOptions extends PlotOptions {
    xScale: d3.ScaleTime<number, number>
    series: number[]
}

export class SimpleTimeLinePlot {
    series: number[]
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    smoothedLine: d3.Line<number>

    constructor(opt: SimpleTimeLinePlotOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(i)
            })
            .y((d) => {
                return this.yScale(d)
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
        })
    }
}

interface SimpleTimeLineFillOptions extends FillOptions {
    xScale: d3.ScaleTime<number, number>
    series: number[]
}

export class SimpleTimeLineFill {
    series: number[]
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    colorIdx: number
    smoothedLine
    dFill: string

    constructor(opt: SimpleTimeLineFillOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color
        this.colorIdx = opt.colorIdx

        this.smoothedLine = d3.line()
            .curve(d3.curveMonotoneX)
            .x((d, i) => {
                return this.xScale(i)
            })
            .y((d) => {
                return this.yScale(d)
            })

        let d = this.smoothedLine(this.series) as string
        this.dFill = `M${this.xScale(0)},0L` + d.substr(1) + `L${this.xScale(this.series.length - 1)},0`
    }

    render($: WeyaElementFunction) {
        $('g', $ => {
            $('path.line-fill',
                {
                    fill: this.color,
                    stroke: 'none',
                    style: {fill: `url(#gradient-${this.colorIdx}`},
                    d: this.dFill
                })
        })
    }
}