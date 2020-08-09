import React, {useEffect} from "react"
import * as d3 from "d3";
import "../components/chart.scss"

const MARGIN = 10
const AXIS_SIZE = 25
const CHART_WIDTH = 480
const CHART_HEIGHT = 240

interface PointValue {
    step: number
    value: number
}

const COLORS = [
    '#2980b9',
    '#c0392b',
    '#27ae60',
    '#d35400',
    '#16a085'
]

function getYScale(series: PointValue[][]): d3.ScaleLinear<number, number> {
    let yExtent = d3.extent(series[0], d => d.value) as [number, number]
    yExtent[0] = Math.min(0, yExtent[0])

    for (let s of series) {
        let e = d3.extent(s, d => d.value) as [number, number]
        yExtent[0] = Math.min(e[0], yExtent[0])
        yExtent[1] = Math.max(e[1], yExtent[1])
    }

    const yScale = d3.scaleLinear<number, number>()
        .domain(yExtent).nice()
        .range([0, -CHART_HEIGHT])

    return yScale
}

function getXScale(series: PointValue[][]): d3.ScaleLinear<number, number> {
    let xExtent = d3.extent(series[0], d => d.step) as [number, number]

    for (let s of series) {
        let e = d3.extent(s, d => d.step) as [number, number]
        xExtent[0] = Math.min(e[0], xExtent[0])
        xExtent[1] = Math.max(e[1], xExtent[1])
    }

    const xScale = d3.scaleLinear()
        .domain(xExtent).nice()
        .range([0, CHART_WIDTH])

    return xScale
}

function getLine(series: PointValue[], xScale: d3.ScaleLinear<number, number>,
                 yScale: d3.ScaleLinear<number, number>, key: number) {
    let line = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return xScale(d.step)
        })
        .y((d) => {
            return yScale(d.value)
        })

    let d: string = line(series) as string

    let path = <path className={'line'} fill={'none'} stroke={COLORS[key]} d={d}/>

    let dFill = `M${xScale(series[0].step)},0L` + d.substr(1) + `L${xScale(series[series.length - 1].step)},0`
    let pathFill = <path className={'line-fill'} fill={COLORS[key]} stroke={'none'} d={dFill}/>

    return <g key={key}>
        {path}{pathFill}
    </g>
}

function SampleChart() {
    const series = [
        [
            {step: 0, value: 1},
            {step: 1, value: 0.2},
            {step: 2, value: 0.18},
            {step: 3, value: 0.12},
            {step: 4, value: 0.15},
        ],
        [
            {step: 0, value: 2},
            {step: 1, value: 0.4},
            {step: 2, value: 0.2},
            {step: 3, value: 0.1},
            {step: 4, value: 0.8},
        ], [
            {step: 1, value: 0.6},
            {step: 2, value: 0.3},
            {step: 3, value: 0.3},
        ]]

    const yScale = getYScale(series)
    const xScale = getXScale(series)
    const xAxis = d3.axisBottom(xScale).ticks(5)
    const yAxis = d3.axisRight(yScale).ticks(5)

    useEffect(() => {
        drawAxes()
    });

    const drawAxes = () => {
        d3.select("#sample-chart .bottom-axis").append('g').call(xAxis)
        d3.select("#sample-chart .right-axis").append('g').call(yAxis)
    }

    // let rects = series.map((d, i) => {
    //     return <rect key={i} x={xScale(d.step)} y={yScale(d.value)} width={40}
    //                  height={-yScale(d.value)} fill={'red'}/>
    // })

    let lines = series.map((s, i) => {
        return getLine(s, xScale, yScale, i)
    })

    return <div>
        <svg id={'sample-chart'}
             height={2 * MARGIN + AXIS_SIZE + CHART_HEIGHT}
             width={2 * MARGIN + AXIS_SIZE + CHART_WIDTH}>
            <g transform={`translate(${MARGIN}, ${MARGIN + CHART_HEIGHT})`}>
                {lines}
            </g>
            <g className={'bottom-axis'}
               transform={`translate(${MARGIN}, ${MARGIN + CHART_HEIGHT})`}/>
            <g className={'right-axis'}
               transform={`translate(${MARGIN + CHART_WIDTH}, ${MARGIN + CHART_HEIGHT})`}/>
        </svg>
    </div>
}

export default SampleChart