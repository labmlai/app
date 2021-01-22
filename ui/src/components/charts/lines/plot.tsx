import React from "react"

import * as d3 from "d3"

import {PointValue} from "../../../models/run"

interface LinePlotProps {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    selectedX?: number
    color: string
    colorIdx?: number
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

    let smoothedPath = <path className={'smoothed-line dropshadow'} fill={'none'} stroke={props.color} d={d}/>
    let unsmoothedPath = <path className={'unsmoothed-line'} fill={'none'} stroke={props.color}
                               d={unsmoothedLine(series) as string}/>
    let selected = null
    if (props.selectedX != null) {
        let y = props.series[0].value
        let x = props.series[0].step
        for (let d of props.series) {
            if (d.step <= props.selectedX) {
                y = d.value
                x = d.step
            }
        }

        selected = <circle r={10} cx={props.xScale(x)} cy={props.yScale(y)}/>
    }

    return <g>
        {smoothedPath}{unsmoothedPath}{selected}
    </g>
}

export function LineFill(props: LinePlotProps) {
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

    let dFill = ''
    dFill = `M${props.xScale(series[0].step)},0L` +
        d.substr(1) +
        `L${props.xScale(props.series[series.length - 1].step)},0`


    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         style={{fill: `url(#gradient-${props.colorIdx}`}} d={dFill}/>

    return <g>
        {pathFill}
    </g>
}