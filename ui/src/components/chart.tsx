import React, {useEffect} from "react"
import * as d3 from "d3";
import "./chart.scss"
import {formatFixed} from "./value";

const SMOOTH_POINTS = 50
const OUTLIER_MARGIN = 0.04
const BASE_COLOR = '#34495e'

interface PointValue {
    step: number
    value: number
    smoothed: number
}

// const FLAT_COLORS = [
//     '#2980b9',
//     '#c0392b',
//     '#27ae60',
//     '#d35400',
//     '#16a085'
// ]

const COLORS = [
    '#4E79A7',
    '#F28E2C',
    '#E15759',
    '#76B7B2',
    '#59A14F',
    '#EDC949',
    '#AF7AA1',
    '#FF9DA7',
    '#9C755F',
    '#BAB0AB']

function getExtentWithoutOutliers(series: PointValue[], func: (d: PointValue) => number): [number, number] {
    let values = series.map(func)
    values.sort((a, b) => a - b)
    if (values.length === 0) {
        return [0, 0]
    }
    if (values.length < 10) {
        return [values[0], values[values.length - 1]]
    }
    let extent = [0, values.length - 1]
    let margin = Math.floor(values.length * OUTLIER_MARGIN)
    let stdDev = d3.deviation(values.slice(margin, values.length - margin))
    if (stdDev == null) {
        stdDev = (values[values.length - margin - 1] - values[margin]) / 2
    }
    for (; extent[0] < margin; extent[0]++) {
        if (values[extent[0]] + stdDev * 2 > values[margin]) {
            break
        }
    }
    for (; extent[1] > values.length - margin - 1; extent[1]--) {
        if (values[extent[1]] - stdDev * 2 < values[values.length - margin - 1]) {
            break
        }
    }

    return [values[extent[0]], values[extent[1]]]
}

function getExtent(series: PointValue[][], func: (d: PointValue) => number, forceZero: boolean = false): [number, number] {
    let extent = getExtentWithoutOutliers(series[0], func)

    for (let s of series) {
        let e = getExtentWithoutOutliers(s, func)
        extent[0] = Math.min(e[0], extent[0])
        extent[1] = Math.max(e[1], extent[1])
    }

    if (forceZero || (extent[0] > 0 && extent[0] / extent[1] < 0.1)) {
        extent[0] = Math.min(0, extent[0])
    }

    return extent
}

function getScale(extent: [number, number], size: number): d3.ScaleLinear<number, number> {
    return d3.scaleLinear<number, number>()
        .domain(extent).nice()
        .range([0, size])
}

export interface SeriesModel {
    name: string
    is_plot: boolean
    step: number[]
    value: number[]
    series: PointValue[]
}

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

function smoothSeries(series: number[]): number[] {
    let span = Math.floor(series.length / SMOOTH_POINTS)
    const spanExtra = Math.floor(span / 2)

    let n = 0
    let sum = 0
    let smoothed: number[] = []
    for (let i = 0; i < series.length + spanExtra; ++i) {
        const j = i - spanExtra
        if (i < series.length) {
            sum += series[i]
            n++
        }
        if (j - spanExtra - 1 >= 0) {
            sum -= series[j - spanExtra - 1]
            n--
        }
        if (j >= 0) {
            smoothed.push(sum / n)
        }
    }

    return smoothed
}

interface LinePlotProps {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
}

function LinePlot(props: LinePlotProps) {
    let series = props.series
    let smoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.smoothed)
        })

    let d: string = smoothedLine(series) as string

    let unsmoothedLine = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.value)
        })

    let smoothedPath = <path className={'smoothed-line'} fill={'none'} stroke={props.color} d={d}/>
    let unsmoothedPath = <path className={'unsmoothed-line'} fill={'none'} stroke={props.color}
                               d={unsmoothedLine(series) as string}/>

    let dFill = `M${props.xScale(series[0].step)},0L` +
        d.substr(1) +
        `L${props.xScale(props.series[series.length - 1].step)},0`
    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         d={dFill}/>

    return <g>
        {smoothedPath}{unsmoothedPath}{pathFill}
    </g>
}

interface ListRowProps {
    name: string
    series: PointValue[]
    color: string
    width: number
    stepExtent: [number, number]
}

function ListRow(props: ListRowProps) {
    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth * 2
    const s = props.series
    const yScale = getScale(getExtent([s], d => d.value, true), -25)
    const xScale = getScale(props.stepExtent, chartWidth)

    const last = s[s.length - 1]
    let value = []
    if (Math.abs(last.value - last.smoothed) > last.value / 1e6) {
        value.push(<text className={'value-secondary'} key={'value'} y={10} dy={"0.2em"} x={props.width}
                         textAnchor={'end'}>
            {formatFixed(last.value, 6)}
        </text>)
        value.push(<text className={'value-primary'} key={'smoothed'} y={10} dy={"1.20em"} x={props.width}
                         textAnchor={'end'}>
            {formatFixed(last.smoothed, 6)}
        </text>)

    } else {
        value.push(<text className={'value-primary'} key={'value'} y={10} dy={"0.71em"} x={props.width}
                         textAnchor={'end'}>
            {formatFixed(last.value, 6)}
        </text>)
    }
    return <g className={'sparkline-list-item'}>
        <text y={10} dy={"0.71em"} fill={props.color}
            //      clipPath={`url(#clip-${props.name})`}
        >{props.name}</text>
        <g transform={`translate(${titleWidth}, 25)`}>
            <LinePlot series={s} xScale={xScale} yScale={yScale} color={'#7f8c8d'}/>
        </g>
        {value}
        {/*<clipPath id={`clip-${props.name}`}>*/}
        {/*    <rect width={100} height={20}/>*/}
        {/*</clipPath>*/}
    </g>
}

interface SeriesProps {
    series: SeriesModel[]
    width: number
}


function LineChart(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)
    const axisSize = 30
    const chartWidth = windowWidth - 2 * margin - axisSize
    const chartHeight = Math.round(chartWidth / 2)
    const itemHeight = 35

    let track = props.series
    for (let s of track) {
        let res: PointValue[] = []
        let smoothed = smoothSeries(s.value)
        for (let i = 0; i < s.step.length; ++i) {
            res.push({step: s.step[i], value: s.value[i], smoothed: smoothed[i]})
        }
        s.series = res
    }

    let plot = track.filter((s => s.is_plot))
    if (plot.length === 0) {
        return <div/>
    }

    let plotSeries = plot.map(s => s.series)
    const yScale = getScale(getExtent(plotSeries, d => d.value, false), -chartHeight)
    const stepExtent = getExtent(plotSeries, d => d.step)
    const xScale = getScale(stepExtent, chartWidth)

    // let rects = series.map((d, i) => {
    //     return <rect key={i} x={xScale(d.step)} y={yScale(d.value)} width={40}
    //                  height={-yScale(d.value)} fill={'red'}/>
    // })

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale} color={COLORS[i]}
                         key={s.name}/>
    })

    const rowWidth = Math.min(450, windowWidth - 3 * margin)
    let list = track.map((s, i) => {
        let color = COLORS[i]
        if (!s.is_plot) {
            color = BASE_COLOR
        }
        return <g key={s.name} transform={`translate(${margin}, ${margin + chartHeight + axisSize + i * itemHeight})`}>
            <ListRow name={s.name} series={s.series} color={color} stepExtent={stepExtent} width={rowWidth}/>
        </g>
    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div className={'card'}>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight + itemHeight * track.length}
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

            {list}
        </svg>
    </div>
}

export default LineChart