import React, {useRef, useState} from "react"

import {SeriesModel} from "../../../models/run"
import {defaultSeriesToPlot, getExtent, getLogScale, getScale} from "../utils"
import {CHART_COLORS, getColor} from "../constants"
import {LineChartProps, chartTypes} from "../types"
import {LinePlot, LineFill} from "./plot"
import {BottomAxis, RightAxis} from "../axis"
import Gradients from "../gradients"
import {LabLoader} from "../../utils/loader"
import {getSparkLines} from "../sparklines/chart"

import "../style.scss"


function LineChart(props: LineChartProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

    const [selectedStep, setSelectedStep] = useState<number | null>(0)
    const chartRef = useRef(null) as any

    let track = props.series

    if (track.length === 0) {
        return <div/>
    }

    let plot: SeriesModel[] = []
    let filteredPlotIdx: number[] = []
    for (let i = 0; i < props.plotIdx.length; i++) {
        if (props.plotIdx[i] >= 0) {
            filteredPlotIdx.push(i)
            plot.push(track[i])
        }
    }
    if (props.plotIdx.length > 0 && Math.max(...props.plotIdx) < 0) {
        plot = [track[0]]
        filteredPlotIdx = [0]
    }

    let plotSeries = plot.map(s => s.series)
    let yScale = getScale(getExtent(plotSeries, d => d.value, false), -chartHeight)
    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const xScale = getScale(stepExtent, chartWidth, false)

    if (props.chartType && props.chartType === 'log') {
        yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -chartHeight)
    }

    let isChartFill = true
    if (plot && plot.length > 3) {
        isChartFill = false
    }

    function updateSelectedStep(ev: any) {
        if (ev.clientX && chartRef.current && props.isMouseMoveAdded) {
            const info = chartRef.current.getBoundingClientRect()
            let currentX = xScale.invert(ev.clientX - info.left - margin)
            setSelectedStep(currentX)
        }
    }

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale}
                         currentX={props.isMouseMoveAdded ? selectedStep : null}
                         color={getColor(filteredPlotIdx[i])} key={s.name}/>

    })

    let fills = plot.map((s, i) => {
        return <LineFill series={s.series} xScale={xScale} yScale={yScale}
                         color={getColor(filteredPlotIdx[i])} key={s.name}
                         colorIdx={filteredPlotIdx[i] % CHART_COLORS.length}/>

    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div className={'detail-card'}>
        <div className={'fixed-chart'}>
            <svg id={'chart'} ref={chartRef}
                 height={2 * margin + axisSize + chartHeight}
                 width={2 * margin + axisSize + chartWidth}
                 onMouseMove={(ev: any) => updateSelectedStep(ev)}>
                <Gradients/>
                <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                    {isChartFill && fills} {lines}
                </g>

                <g className={'bottom-axis'}
                   transform={`translate(${margin}, ${margin + chartHeight})`}>
                    <BottomAxis chartId={chartId} scale={xScale}/>
                </g>
                <g className={'right-axis'}
                   transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                    <RightAxis chartId={chartId} scale={yScale}/>
                </g>
            </svg>
        </div>
        {getSparkLines(track, props.plotIdx, props.width, props.onSelect,
            props.isMouseMoveAdded ? selectedStep : null)}
    </div>
}

export function getLineChart(chartType: typeof chartTypes, track: SeriesModel[] | null, plotIdx: number[] | null,
                             width: number, onSelect?: (i: number) => void, isMouseMoveAdded: boolean = false) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }

        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }

        return <LineChart key={1} chartType={chartType} series={track} width={width} plotIdx={plotIdx}
                          onSelect={onSelect} isMouseMoveAdded={isMouseMoveAdded}/>
    } else {
        return <LabLoader/>
    }
}