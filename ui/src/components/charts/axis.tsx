import React, {useEffect} from "react"

import * as d3 from "d3"

interface AxisProps {
    chartId: string
    scale: d3.ScaleLinear<number, number>
    specifier?: string
    numTicks?: number
}

interface TimeAxisProps {
    chartId: string
    scale: d3.ScaleTime<number, number>
    specifier?: string
    numTicks?: number
}

export function BottomAxis(props: AxisProps) {
    let specifier = props.specifier !== undefined ? props.specifier : ".2s"

    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(5, specifier)
    const id = `${props.chartId}_axis_bottom`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [id, axis])

    return <g id={id}/>
}

export function BottomTimeAxis(props: TimeAxisProps) {
    let numTicks = props.numTicks !== undefined ? props.numTicks : 4

    const axis = d3.axisBottom(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(numTicks, d3.timeFormat("%b-%d:%H:%M"))

    const id = `${props.chartId}_axis_bottom`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [id, axis])

    return <g id={id}/>
}

export function RightAxis(props: AxisProps) {
    let specifier = props.specifier !== undefined ? props.specifier : ""
    let numTicks = props.numTicks !== undefined ? props.numTicks : 5

    const axis = d3.axisRight(props.scale as d3.AxisScale<d3.AxisDomain>).ticks(numTicks, specifier)
    const id = `${props.chartId}_axis_right`
    useEffect(() => {
        let layer = d3.select(`#${id}`)
        layer.selectAll('g').remove()
        layer.append('g').call(axis)
    }, [axis, id])


    return <g id={id}/>
}
