import React, {useEffect} from "react"
import * as d3 from "d3";
import "./style.scss"
import {PointValue, SeriesModel} from "../../../models/run";
import {ListGroup} from "react-bootstrap"
import {CHART_COLORS} from "./constants";
import {LinePlot} from "./line_plot";
import {getExtent, getScale} from "./utils";
import {SparkLine} from "./sparkline";


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


export function LineChart(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)
    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)

    let track = props.series
    for (let s of track) {
        let res: PointValue[] = []
        for (let i = 0; i < s.step.length; ++i) {
            res.push({step: s.step[i], value: s.value[i], smoothed: s.smoothed[i]})
        }
        s.series = res
    }

    if (track.length === 0) {
        return <div/>
    }
    let plot = track.filter(((s, i) => props.plotIdx[i] >= 0))
    let filteredPlotIdx = props.plotIdx.filter(s => s >= 0)
    if (props.plotIdx.length > 0 && Math.max(...props.plotIdx) < 0) {
        plot = [track[0]]
        filteredPlotIdx = [0]
    }

    let plotSeries = plot.map(s => s.series)
    const yScale = getScale(getExtent(plotSeries, d => d.value, false), -chartHeight)
    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const xScale = getScale(stepExtent, chartWidth)

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale}
                         color={CHART_COLORS[filteredPlotIdx[i]]} key={s.name}/>
    })

    const rowWidth = Math.min(450, windowWidth - 3 * margin)
    let list = track.map((s, i) => {
        let onClick
        if (props.onSelect != null) {
            onClick = props.onSelect.bind(null, i)
        }
        return <SparkLine key={s.name} name={s.name} series={s.series} selected={props.plotIdx[i]} stepExtent={stepExtent}
                          width={rowWidth} onClick={onClick}/>
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

        <ListGroup className={'sparkline-list'}>
            {list}
        </ListGroup>
    </div>
}
