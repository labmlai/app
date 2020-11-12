import {PointValue} from "../../../models/run"
import * as d3 from "d3"
import React from "react"

interface LinePlotProps {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    isChartFill?: boolean
}

export function LinePlot(props: LinePlotProps) {
    let series = props.series
    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string

    let unsmoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.value)
        })

    let smoothedPath = <path className={'smoothed-line'} fill={'none'} stroke={props.color} d={d}/>
    let unsmoothedPath = <path className={'unsmoothed-line'} fill={'none'} stroke={props.color}
                               d={unsmoothedLine(series) as string}/>

    let dFill = ''
    if (props.isChartFill) {
        dFill = `M${props.xScale(series[0].step)},0L` +
            d.substr(1) +
            `L${props.xScale(props.series[series.length - 1].step)},0`
    }

    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         d={dFill}/>

    return <g>
        {smoothedPath}{unsmoothedPath}{pathFill}
    </g>
}