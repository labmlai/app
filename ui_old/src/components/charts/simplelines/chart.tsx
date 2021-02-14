import React from "react"

import {SeriesModel} from "../../../models/run"
import {getScale} from "../utils"
import {SimpleLinePlot} from "./plot"
import {RightAxis} from "../axis"
import {getColor} from "../constants"
import {LabLoader} from "../../utils/loader"
import {SimpleLineFill} from "./plot"
import Labels from "../labels"
import Gradients from "../gradients"


interface SimpleLinesProps {
    series: SeriesModel[]
    width: number
}

function SimpleLineChart(props: SimpleLinesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 4)

    let track = props.series

    if (track.length === 0) {
        return <div/>
    }

    let plot: number[] = []
    let labels: string[] = []
    for (let s of track) {
        plot.push(...s.value)
        labels.push(s.name)
    }

    const xScale = getScale([0, track[0].value.length - 1], chartWidth, false)
    const yScale = getScale([Math.min(...plot), Math.max(...plot)], -chartHeight)

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    let lines = track.map((s, i) => {
        return <SimpleLinePlot series={s.value} xScale={xScale} yScale={yScale} color={getColor(i)}
                               key={s.name}/>

    })

    let fills = track.map((s, i) => {
        return <SimpleLineFill series={s.value} xScale={xScale} yScale={yScale} color={getColor(i)}
                               key={s.name} colorIdx={i}/>
    })

    return <div>
        <svg id={'chart'}
             height={2 * margin + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <Gradients/>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                <g>
                    {fills}{lines}
                </g>
            </g>
            <g className={'right-axis'}
               transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                <RightAxis chartId={chartId} scale={yScale}/>
            </g>
        </svg>
        <Labels labels={labels}/>
    </div>
}

export function getSimpleLineChart(series: SeriesModel[] | null, width: number) {
    if (series != null) {
        if (series.length === 0) {
            return null
        }

        return <SimpleLineChart series={series} width={width}/>
    } else {
        return <LabLoader/>
    }
}