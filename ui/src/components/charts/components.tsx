import React, {useEffect} from "react"

import * as d3 from "d3"
import {ListGroup} from "react-bootstrap"

import {SeriesModel} from "../../models/run"
import {getColor} from "./constants"
import {LinePlot} from "./lineplot"
import {DensityPlot} from "./densityplot"
import {defaultSeriesToPlot, getExtent, getScale, getLogScale, toPointValues} from "./utils"
import {SparkLine} from "./sparkline"
import {LabLoader} from "../utils/loader"

import "./style.scss"


interface AxisProps {
    chartId: string
    scale: d3.ScaleLinear<number, number>
}

function BottomAxis(props: AxisProps) {
    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>)
        .ticks(5, ".2s")
    const id = `${props.chartId}_axis_bottom`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [id, axis])


    return <g id={id}/>
}

function RightAxis(props: AxisProps) {
    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `${props.chartId}_axis_right`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [axis, id])


    return <g id={id}/>
}

interface SeriesProps {
    series: SeriesModel[]
    plotIdx: number[]
    width: number
    onSelect?: (i: number) => void
}

function SparkLines(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    let track = props.series

    let lastValues: number[] = []
    for (let s of track) {
        let series = s.series
        lastValues.push(series[series.length - 1].value)
    }

    let maxLastValue = Math.max(...lastValues)
    let minLastValue = Math.min(...lastValues)

    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const rowWidth = Math.min(450, windowWidth - 3 * margin)

    let colorIndices: number[] = []
    for (let i = 0; i < props.plotIdx.length; i++) {
        if (props.plotIdx[i] >= 0) {
            colorIndices.push(i)
        } else {
            colorIndices.push(-1)
        }
    }

    let sparkLines = track.map((s, i) => {
        let onClick
        if (props.onSelect != null) {
            onClick = props.onSelect.bind(null, i)
        }
        return <SparkLine key={s.name} name={s.name} series={s.series} selected={props.plotIdx[i]}
                          stepExtent={stepExtent} width={rowWidth} onClick={onClick} minLastValue={minLastValue}
                          maxLastValue={maxLastValue} color={getColor(colorIndices[i])}/>
    })

    return <ListGroup className={'sparkline-list'}>
        {sparkLines}
    </ListGroup>
}

interface LineChartProps extends SeriesProps {
    chartType?: 'log' | 'normal'
}

function LineChart(props: LineChartProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

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
    const xScale = getScale(stepExtent, chartWidth)

    if (props.chartType && props.chartType === 'log') {
        yScale = getLogScale(getExtent(plotSeries, d => d.value, false, true), -chartHeight)
    }

    let isChartFill = true
    if (plot && plot.length > 3) {
        isChartFill = false
    }

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale}
                         color={getColor(filteredPlotIdx[i])} key={s.name} isChartFill={isChartFill}/>
    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                {lines}
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
}

function DensityChart(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

    let track: SeriesModel[] = props.series

    let plot: number[] = []
    track.forEach(function (series) {
        const values = series.value
        for (let i = 0; i < values.length; i++) {
            plot.push(values[i])
        }
    });


    if (track.length === 0) {
        return <div/>
    }

    const yScale = getScale([0, 1], -chartHeight)
    const xScale = getScale(getExtent(track.map(s => s.series), d => d.value), chartWidth)

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                <DensityPlot series={plot} xScale={xScale} yScale={yScale} color={'#4E79A7'}/>
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

}

let chartTypes: 'log' | 'normal'

export function getLineChart(chartType: typeof chartTypes, track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }
        let series: SeriesModel[] = toPointValues(track)
        return <LineChart key={1} chartType={chartType} series={series} width={width} plotIdx={plotIdx}
                          onSelect={onSelect}/>
    } else {
        return <LabLoader/>
    }
}

export function getSparkLines(track: SeriesModel[] | null, plotIdx: number[] | null, width: number, onSelect?: ((i: number) => void)) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }

        let series: SeriesModel[] = toPointValues(track)
        return <SparkLines series={series} width={width} plotIdx={plotIdx} onSelect={onSelect}/>
    } else {
        return <LabLoader/>
    }
}

export function getDensityChart(track: SeriesModel[] | null, width: number) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }

        let series: SeriesModel[] = toPointValues(track)

        return <DensityChart series={series} width={width} plotIdx={[]}/>
    } else {
        return <LabLoader/>
    }
}