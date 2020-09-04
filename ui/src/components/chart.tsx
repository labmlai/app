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


function getScale(series: PointValue[][], func: (d: PointValue) => number, size: number): d3.ScaleLinear<number, number> {
    let extent = d3.extent(series[0], func) as [number, number]
    extent[0] = Math.min(0, extent[0])

    for (let s of series) {
        let e = d3.extent(s, func) as [number, number]
        extent[0] = Math.min(e[0], extent[0])
        extent[1] = Math.max(e[1], extent[1])
    }

    return d3.scaleLinear<number, number>()
        .domain(extent).nice()
        .range([0, size])
}

function getYScale(series: PointValue[][], size: number): d3.ScaleLinear<number, number> {
    return getScale(series, d => d.value, -size)
}

function getXScale(series: PointValue[][], size: number): d3.ScaleLinear<number, number> {
    return getScale(series, d => d.step, size)
}


export interface SeriesModel {
    name: string
    is_plot: boolean
    step: number[]
    value: number[]
    series: PointValue[]
}

interface AxisProps {
    scale: d3.ScaleLinear<number, number>
}

function BottomAxis(props: AxisProps) {
    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `axis_${Math.round(Math.random() * 1e9)}`
    useEffect(() => {
        d3.select(`#${id}`).append('g').call(axis)
    });


    return <g id={id}/>
}

function RightAxis(props: AxisProps) {
    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `axis_${Math.round(Math.random() * 1e9)}`
    useEffect(() => {
        d3.select(`#${id}`).append('g').call(axis)
    });


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
}

function ListRow(props: ListRowProps) {
    const colWidth = Math.round(props.width * .375)
    const s = props.series
    const yScale = getYScale([s], 25)
    const xScale = getXScale([s], colWidth)

    return <g className={'sparkline-list-item'}>
        <text y={10} dy={"0.71em"} fill={COLORS[props.idx]}
            //      clipPath={`url(#clip-${props.name})`}
        >{props.name}</text>
        <g transform={`translate(${colWidth}, 25)`}>
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
    const margin = Math.floor(props.width / 64)
    const axisSize = 30
    const chartWidth = props.width - 2 * margin - axisSize
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
    const yScale = getYScale(plotSeries, chartHeight)
    const xScale = getXScale(plotSeries, chartWidth)

    // let rects = series.map((d, i) => {
    //     return <rect key={i} x={xScale(d.step)} y={yScale(d.value)} width={40}
    //                  height={-yScale(d.value)} fill={'red'}/>
    // })

    let lines = plot.map((s, i) => {
        return <LinePlot series={s.series} xScale={xScale} yScale={yScale} color={COLORS[i]}
                         key={s.name}/>
    })

    let list = track.map((s, i) => {
        return <g key={s.name}
                  transform={`translate(${margin}, ${margin + chartHeight + axisSize + i * itemHeight})`}>
            <ListRow name={s.name} series={s.series} idx={i} width={props.width - 2 * margin}/>
        </g>
    })

    return <div>
        <svg id={'chart'}
             height={2 * margin + axisSize + chartHeight + itemHeight * track.length}
             width={2 * margin + axisSize + chartWidth}>
            <g transform={`translate(${margin}, ${margin + chartHeight})`}>
                {lines}
            </g>

            <g className={'bottom-axis'}
               transform={`translate(${margin}, ${margin + chartHeight})`}>
                <BottomAxis scale={xScale}/>
            </g>
            <g className={'right-axis'}
               transform={`translate(${margin + chartWidth}, ${margin + chartHeight})`}>
                <RightAxis scale={yScale}/>
            </g>

            {list}
        </svg>
    </div>
}

export default LineChart