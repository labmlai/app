import React, {useRef, useState} from "react"

import {SeriesModel} from "../../../models/run"
import {defaultSeriesToPlot, getExtent, getLogScale, getScale, getTimeScale, toDate} from "../utils"
import {TimeSeriesPlot, TimeSeriesFill} from "./plot"
import {CHART_COLORS, getColor} from "../constants"
import {LineChartProps, chartTypes} from "../types"
import {BottomTimeAxis, RightAxis} from "../axis"
import Gradients from "../gradients"
import {LabLoader} from "../../utils/loader"
import {formatDateTime} from "../../../utils/time"
import {getSparkTimeLines} from "../sparktimelines/chart"
import isMobile from "../../../utils/mobile"


interface TimeSeriesChartProps extends LineChartProps {
    yExtend?: [number, number] | null
    stepExtend?: [number, number] | null
    chartHeightFraction?: number
    forceYStart?: number | null
    numTicks?: number
    isSparkLines: boolean
}


function TimeSeriesChart(props: TimeSeriesChartProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    let chartHeight = Math.round(chartWidth / 2)

    if (props.chartHeightFraction) {
        chartHeight = chartHeight / props.chartHeightFraction
    }

    const [selectedStep, setSelectedStep] = useState<Date | null>(null)
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
    let yExtend = props.yExtend ? props.yExtend : getExtent(plotSeries, d => d.value, false)
    if (typeof props.forceYStart === 'number') {
        yExtend[0] = props.forceYStart
    }
    let yScale = getScale(yExtend, -chartHeight)
    const stepExtent = props.stepExtend ? props.stepExtend : getExtent(track.map(s => s.series), d => d.step)
    const xScale = getTimeScale([toDate(stepExtent[0]), toDate(stepExtent[1])], chartWidth)

    if (props.chartType && props.chartType === 'log') {
        yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -chartHeight)
    }

    let isChartFill = true
    if (plot && plot.length > 3) {
        isChartFill = false
    }

    function updateSelectedStep(ev: any) {
        let clientX = isMobile ? ev.touches[0].clientX : ev.clientX
        if (clientX && chartRef.current && props.isMouseMoveAdded) {
            const info = chartRef.current.getBoundingClientRect()
            let currentX = xScale.invert(clientX - info.left - margin)
            setSelectedStep(currentX)
        }
    }

    let lines = plot.map((s, i) => {
        return <TimeSeriesPlot series={s.series} xScale={xScale} yScale={yScale}
                               currentX={props.isMouseMoveAdded ? selectedStep : null}
                               color={getColor(filteredPlotIdx[i])}
                               key={s.name}/>

    })

    let fills = plot.map((s, i) => {
        return <TimeSeriesFill series={s.series} xScale={xScale} yScale={yScale} color={getColor(filteredPlotIdx[i])}
                               key={s.name} colorIdx={filteredPlotIdx[i] % CHART_COLORS.length}/>
    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`


    return <div className={'detail-card'}>
        {selectedStep && <h6 className={'text-center selected-step'}>{formatDateTime(selectedStep)}</h6>}
        <div className={props.isMouseMoveAdded ? 'fixed-chart' : ''}>
            <svg id={'time-series-chart'} ref={chartRef}
                 height={2 * margin + axisSize + chartHeight}
                 width={2 * margin + axisSize + chartWidth}
                 onMouseMove={(ev: any) => updateSelectedStep(ev)}
                 onTouchMove={(ev: any) => updateSelectedStep(ev)}>
                <Gradients/>
                <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                    {isChartFill && fills}{lines}
                </g>
                <g className={'bottom-axis'}
                   transform={`translate(${margin}, ${margin + chartHeight})`}>
                    <BottomTimeAxis chartId={chartId} scale={xScale}/>
                </g>
                <g className={'right-axis'}
                   transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                    <RightAxis chartId={chartId} scale={yScale} specifier={'.1s'} numTicks={props.numTicks}/>
                </g>
            </svg>
        </div>
        {props.isSparkLines && getSparkTimeLines(track, props.plotIdx, props.width, props.onSelect,
            props.isMouseMoveAdded ? selectedStep : null)}
    </div>
}


export function getTimeSeriesChart(chartType: typeof chartTypes, track: SeriesModel[] | null, plotIdx: number[] | null,
                                   width: number, onSelect?: ((i: number) => void), yExtend: [number, number] | null = null,
                                   chartHeightFraction: number = 1, forceYStart: number | null = null, numTicks: number = 5,
                                   isMouseMoveAdded: boolean = false, isSparkLines: boolean = false) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }

        const ref = track[0].step

        return <TimeSeriesChart key={1} chartType={chartType} series={track} width={width} plotIdx={plotIdx}
                                onSelect={onSelect} yExtend={yExtend} stepExtend={[ref[0], ref[ref.length - 1]]}
                                chartHeightFraction={chartHeightFraction} forceYStart={forceYStart}
                                numTicks={numTicks} isMouseMoveAdded={isMouseMoveAdded} isSparkLines={isSparkLines}/>
    } else {
        return <LabLoader/>
    }
}