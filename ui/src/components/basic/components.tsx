import React, {useEffect} from "react"
import * as d3 from "d3"
import "./style.scss"
import {SeriesModel} from "../../models/run"
import {ListGroup} from "react-bootstrap"
import {getColor} from "./constants"
import {LinePlot} from "./line_plot"
import {getExtent, getScale, toPointValues} from "./utils"
import {SparkLine} from "./sparkline"


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
    })


    return <g id={id}/>
}

function RightAxis(props: AxisProps) {
    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `${props.chartId}_axis_right`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    })


    return <g id={id}/>
}

interface SeriesProps {
    series: SeriesModel[]
    plotIdx: number[]
    width: number
    onSelect?: (i: number) => void
}

export function SparkLines(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    let track = toPointValues(props.series)

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

export function LineChart(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)
    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

    let track = toPointValues(props.series)

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
    const yScale = getScale(getExtent(plotSeries, d => d.value, false), -chartHeight)
    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const xScale = getScale(stepExtent, chartWidth)

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

        <SparkLines series={props.series} plotIdx={props.plotIdx} width={props.width} onSelect={props.onSelect}/>
    </div>
}
