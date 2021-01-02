import React from "react"

import * as d3 from "d3"

interface SimpleLinePlotProps {
    series: number[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
}

export function SimpleLinePlot(props: SimpleLinePlotProps) {
    let series = props.series

    let smoothedLine = d3.line<number>()
        .curve(d3.curveMonotoneX)
        .x((d, i) => {
            return props.xScale(i)
        })
        .y((d) => {
            return props.yScale(d)
        })

    let d: string = smoothedLine(series) as string

    let smoothedPath = <path className={'density-line'} fill={'none'} stroke={props.color} d={d}/>

    let dFill = ''
    dFill = `M${props.xScale(0)},0L` +
        d.substr(1) +
        `L${props.xScale(series.length - 1)},0`


    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'} d={dFill}/>

    return <g>
        {smoothedPath}{pathFill}
    </g>
}