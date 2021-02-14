import d3 from "../../../d3"
import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {PlotOptions} from '../types'

export class SimpleLinePlot {
    series: number[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    d: string

    constructor(opt: PlotOptions) {
        this.series = opt.series
        this.xScale = opt.xScale
        this.yScale = opt.yScale
        this.color = opt.color

        this.d = this.smoothedLine(this.series) as string
    }

    smoothedLine = d3.line()
        .curve(d3.curveMonotoneX)
        .x((d, i) => {
            return this.xScale(i)
        })
        .y((d) => {
            return this.yScale(d)
        })

    render($: WeyaElementFunction) {

    }
}


export class SimpleLineFill {

}
