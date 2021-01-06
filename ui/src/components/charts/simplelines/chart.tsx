import React from "react"

import {SeriesSummaryModel} from "../../../models/run"
import {getScale} from "../utils"
import {SimpleLinePlot} from "./plot"
import {RightAxis} from "../axis"
import {getColor} from "../constants"
import {LabLoader} from "../../utils/loader"
import {SimpleLineFill} from "./plot"


interface SimpleLinesProps {
    seriesSummary: SeriesSummaryModel[]
    width: number
}

function SimpleLineChart(props: SimpleLinesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 4)

    let track = props.seriesSummary

    if (track.length === 0) {
        return <div/>
    }

    let l1: number[] = []
    let l2: number[] = []
    let mean: number[] = []
    track.forEach(function (summary) {
        l1.push(summary.l1)
        l2.push(summary.l2)
        mean.push(summary.mean)
    })

    let plot: number[] = []
    plot.push(...l1)
    plot.push(...l2)
    plot.push(...mean)

    const xScale = getScale([0, l1.length - 1], chartWidth)
    const yScale = getScale([Math.min(...plot), Math.max(...plot)], -chartHeight)

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div>
        <svg id={'chart'}
             height={2 * margin + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                <g>
                    <SimpleLineFill series={mean} xScale={xScale} yScale={yScale} color={getColor(1)} key={1}
                                    colorIdx={1}/>
                    <SimpleLineFill series={l1} xScale={xScale} yScale={yScale} color={getColor(2)} key={2}
                                    colorIdx={2}/>
                    <SimpleLineFill series={l2} xScale={xScale} yScale={yScale} color={getColor(3)} key={3}
                                    colorIdx={3}/>
                    <SimpleLinePlot series={mean} xScale={xScale} yScale={yScale} color={getColor(1)} key={4}/>
                    <SimpleLinePlot series={l1} xScale={xScale} yScale={yScale} color={getColor(2)} key={5}/>
                    <SimpleLinePlot series={l2} xScale={xScale} yScale={yScale} color={getColor(3)} key={6}/>
                </g>
            </g>
            <g className={'right-axis'}
               transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                <RightAxis chartId={chartId} scale={yScale}/>
            </g>
        </svg>
        <div className={'text-center labels text-secondary'}>
            <div className='box' style={{backgroundColor: getColor(1)}}></div>
            Mean
            <div className='box' style={{backgroundColor: getColor(2)}}></div>
            L1 - Norm
            <div className='box' style={{backgroundColor: getColor(3)}}></div>
            L2 - Norm
        </div>
    </div>
}

export function getSimpleLineChart(seriesSummary: SeriesSummaryModel[] | null, width: number) {
    if (seriesSummary != null) {
        if (seriesSummary.length === 0) {
            return null
        }

        return <SimpleLineChart seriesSummary={seriesSummary} width={width}/>
    } else {
        return <LabLoader/>
    }
}