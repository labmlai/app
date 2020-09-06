import React, {useEffect} from "react"
import * as d3 from "d3";
import "./chart.scss"
import {formatFixed} from "./value";


interface PointValue {
    step: number
    value: number
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


function getExtent(series: PointValue[][], func: (d: PointValue) => number, forceZero: boolean = false): [number, number] {
    let extent = d3.extent(series[0], func) as [number, number]

    for (let s of series) {
        let e = d3.extent(s, func) as [number, number]
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

function getXScale(series: PointValue[][], size: number): d3.ScaleLinear<number, number> {
    let extent = getExtent(series, d => d.step)

    return getScale(extent, size)
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
    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
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

interface LinePlotProps {
    series: PointValue[]
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>
    color: string
}

function LinePlot(props: LinePlotProps) {
    let line = d3.line<PointValue>()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return props.xScale(d.step)
        })
        .y((d) => {
            return props.yScale(d.value)
        })

    let d: string = line(props.series) as string

    let path = <path className={'line'} fill={'none'} stroke={props.color} d={d}/>

    let dFill = `M${props.xScale(props.series[0].step)},0L` +
        d.substr(1) +
        `L${props.xScale(props.series[props.series.length - 1].step)},0`
    let pathFill = <path className={'line-fill'} fill={props.color} stroke={'none'}
                         d={dFill}/>

    return <g>
        {path}{pathFill}
    </g>
}

interface ListRowProps {
    name: string
    series: PointValue[]
    idx: number
    width: number
    stepExtent: [number, number]
}

function ListRow(props: ListRowProps) {
    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth * 2
    const s = props.series
    const yScale = getScale(getExtent([s], d => d.value, true), -25)
    const xScale = getScale(props.stepExtent, chartWidth)

    return <g className={'sparkline-list-item'}>
        <text y={10} dy={"0.71em"} fill={COLORS[props.idx]}
            //      clipPath={`url(#clip-${props.name})`}
        >{props.name}</text>
        <g transform={`translate(${titleWidth}, 25)`}>
            <LinePlot series={s} xScale={xScale} yScale={yScale} color={'#7f8c8d'}/>
        </g>
        <text y={10} dy={"0.71em"} x={props.width} textAnchor={'end'} fill={'currentColor'}>
            {formatFixed(s[s.length - 1].value, 6)}
        </text>

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
        for (let i = 0; i < s.step.length; ++i) {
            res.push({step: s.step[i], value: s.value[i]})
        }
        s.series = res
    }

    let plot = track.filter((s => s.is_plot))
    let plotSeries = plot.map(s => s.series)
    const yScale = getScale(getExtent(plotSeries, d => d.value, true), -chartHeight)
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
        return <g key={s.name} transform={`translate(${margin}, ${margin + chartHeight + axisSize + i * itemHeight})`}>
            <ListRow name={s.name} series={s.series} idx={i} stepExtent={stepExtent} width={rowWidth}/>
        </g>
    })

    const chartId = `chart_${Math.round(Math.random() * 1e9)}`

    return <div>
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