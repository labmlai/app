import React from "react"

import * as d3 from "d3"

import {PointValue} from "../../../models/run"
import {getSelectedIdx, toDate} from "../utils"


interface TimeSeriesPlotProps {
    series: PointValue[]
    xScale: d3.ScaleTime<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
    colorIdx?: number
    currentX?: Date | null
}

export function TimeSeriesPlot(props: TimeSeriesPlotProps) {
    let series = props.series

    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(toDate(d.step))
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string

    let unsmoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(toDate(d.step))
        })
        .y((d) => {
            return props.yScale(d.value)
        })

    let smoothedPath = <path className={'smoothed-line dropshadow'} fill={'none'} stroke={props.color} d={d}/>
    let unsmoothedPath = <path className={'unsmoothed-line'} fill={'none'} stroke={props.color}
                               d={unsmoothedLine(series) as string}/>

    const bisect = d3.bisector(function (d: PointValue) {
        return toDate(d.step)
    }).left

    let selected = null
    if (props.currentX != null) {
        let idx = getSelectedIdx(props.series, bisect, props.currentX)
        selected = <circle r={5} cx={props.xScale(toDate(props.series[idx].step))}
                           cy={props.yScale(props.series[idx].smoothed)}
                           fill={props.color}/>
    }


    return <g>
        {smoothedPath}{unsmoothedPath}{selected}
    </g>
}

export function TimeSeriesFill(props: TimeSeriesPlotProps) {
    let series = props.series

    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(toDate(d.step))
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string

    let dFill = ''
    dFill = `M${props.xScale(toDate(series[0].step))},0L` +
        d.substr(1) +
        `L${props.xScale(toDate(props.series[series.length - 1].step))},0`


    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         style={{fill: `url(#gradient-${props.colorIdx}`}} d={dFill}/>


    return <g>
        {pathFill}
    </g>
}