import React, {useEffect} from "react"
import * as d3 from "d3";
import "./chart.scss"
import {formatFixed} from "./value";

const MARGIN = 10
const AXIS_SIZE = 30
const CHART_WIDTH = 480
const CHART_HEIGHT = 240
const ITEM_HEIGHT = 35

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

function getYScale(series: PointValue[][], size = CHART_HEIGHT): d3.ScaleLinear<number, number> {
    return getScale(series, d => d.value, -size)
}

function getXScale(series: PointValue[][], size = CHART_WIDTH): d3.ScaleLinear<number, number> {
    return getScale(series, d => d.step, size)
}


export interface SeriesModel {
    name: string
    is_plot: boolean
    step: number[]
    value: number[]
    series: PointValue[]
}

interface SeriesProps {
    series: SeriesModel[]
}

interface AxisProps {
    scale: d3.ScaleLinear<number, number>
}

function BottomAxis(props: AxisProps) {
    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `axis_${Math.round(Math.random() * 1e9)}`
    useEffect(() => {
        console.log(`#${id}`)
        d3.select(`#${id}`).append('g').call(axis)
    });


    return <g id={id}/>
}

function RightAxis(props: AxisProps) {
    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5)
    const id = `axis_${Math.round(Math.random() * 1e9)}`
    useEffect(() => {
        console.log(`#${id}`)
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
    const s = props.series
    const yScale = getYScale([s], 25)
    const xScale = getXScale([s], 150)

    return <g className={'sparkline-list-item'}>
        <text y={10} dy={"0.71em"} fill={COLORS[props.idx]}
            //      clipPath={`url(#clip-${props.name})`}
        >{props.name}</text>
        <g transform={'translate(150, 25)'}>
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

function LineChart(props: SeriesProps) {
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
    const yScale = getYScale(plotSeries)
    const xScale = getXScale(plotSeries)

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
                  transform={`translate(${MARGIN}, ${MARGIN + CHART_HEIGHT + AXIS_SIZE + i * ITEM_HEIGHT})`}>
            <ListRow name={s.name} series={s.series} idx={i} width={CHART_WIDTH}/>
        </g>
    })

    return <div>
        <svg id={'chart'}
             height={2 * MARGIN + AXIS_SIZE + CHART_HEIGHT + ITEM_HEIGHT * track.length}
             width={2 * MARGIN + AXIS_SIZE + CHART_WIDTH}>
            <g transform={`translate(${MARGIN}, ${MARGIN + CHART_HEIGHT})`}>
                {lines}
            </g>

            <g className={'bottom-axis'}
               transform={`translate(${MARGIN}, ${MARGIN + CHART_HEIGHT})`}>
                <BottomAxis scale={xScale}/>
            </g>
            <g className={'right-axis'}
               transform={`translate(${MARGIN + CHART_WIDTH}, ${MARGIN + CHART_HEIGHT})`}>
                <RightAxis scale={yScale}/>
            </g>

            {list}
        </svg>
    </div>
}

export default LineChart