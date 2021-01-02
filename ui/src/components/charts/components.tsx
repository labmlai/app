import React, {useEffect} from "react"

import * as d3 from "d3"
import {ListGroup} from "react-bootstrap"

import {SeriesModel, SeriesSummaryModel} from "../../models/run"
import {getColor} from "./constants"
import {LinePlot} from "./lineplot"
import {SimpleLinePlot} from "./simplelineplot"
import {
    defaultSeriesToPlot,
    getExtent,
    getScale,
    getLogScale,
    toPointValues,
    kernelDensityEstimator,
    kernelEpanechnikov,
    silvermansRuleOfThumb
} from "./utils"
import {SparkLine} from "./sparkline"
import {LabLoader} from "../utils/loader"

import "./style.scss"


interface AxisProps {
    chartId: string
    scale: d3.ScaleLinear<number, number>
    specifier?: string
}

function BottomAxis(props: AxisProps) {
    let specifier = props.specifier !== undefined ? props.specifier : ".2s"

    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>)
        .ticks(5, specifier)
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
             height={2 * margin + axisSize + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                <g>
                    <SimpleLinePlot series={l1} xScale={xScale} yScale={yScale} color={getColor(4)} key={1}/>
                    <SimpleLinePlot series={l2} xScale={xScale} yScale={yScale} color={getColor(5)} key={2}/>
                    <SimpleLinePlot series={mean} xScale={xScale} yScale={yScale} color={getColor(2)} key={3}/>
                </g>
            </g>
            <g className={'right-axis'}
               transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                <RightAxis chartId={chartId} scale={yScale}/>
            </g>
        </svg>
    </div>
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

interface DensityChartProps extends SeriesProps {
    color: string
}

function DensityChart(props: DensityChartProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 4)

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

    const xScale = getScale(getExtent(track.map(s => s.series), d => d.value), chartWidth)

    const bandwidth = silvermansRuleOfThumb(plot)

    // Compute kernel density estimation
    let kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), xScale.ticks(plot.length))
    let density = kde(plot)

    let yValues: number[] = []
    for (let i = 0; i < density.length; i++) {
        yValues.push(density[i][1])
    }

    const yScale = getScale([Math.min(...yValues), Math.max(...yValues)], -chartHeight)

    let densityLine = d3.line<number[]>()
        .curve(d3.curveBasis)
        .x((d) => {
            return xScale(d[0])
        })
        .y((d) => {
            return yScale(d[1])
        })

    let d: string = densityLine(density) as string

    let densityPath = <path className={'density-line'} fill={'none'} stroke={props.color} d={d}/>

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    let dFill = ''
    const plotSorted = plot.sort()
    dFill = `M${xScale(plotSorted[0])},0L` +
        d.substr(1) +
        `L${xScale(plotSorted[plotSorted.length - 1])},0`


    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         d={dFill}/>

    return <div>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                <g>
                    {densityPath}{pathFill}
                </g>
            </g>

            <g className={'bottom-axis'}
               transform={`translate(${margin}, ${margin + chartHeight})`}>
                <BottomAxis chartId={chartId} scale={xScale} specifier={""}/>
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

export function getDensityChart(track: SeriesModel[] | null, width: number, color: string) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }

        let series: SeriesModel[] = toPointValues(track)

        return <DensityChart series={series} width={width} plotIdx={[]} color={color}/>
    } else {
        return <LabLoader/>
    }
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