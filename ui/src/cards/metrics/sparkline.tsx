import {PointValue} from "../../models/run";
import {formatFixed} from "../../components/value";
import {ListGroup} from "react-bootstrap";
import React from "react";
import {getExtent, getScale} from "./utils";
import {LinePlot} from "./line_plot";

interface SparkLineProps {
    name: string
    series: PointValue[]
    color: string
    width: number
    stepExtent: [number, number]
    onClick?: () => void
}

export function SparkLine(props: SparkLineProps) {
    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth * 2
    const s = props.series
    const yScale = getScale(getExtent([s], d => d.value, true), -25)
    const xScale = getScale(props.stepExtent, chartWidth)

    const last = s[s.length - 1]
    let value
    if (Math.abs(last.value - last.smoothed) > last.value / 1e6) {
        value = <span className={'value'} style={{width: `${titleWidth}px`}}>
            <span className={'value-secondary'} key={'value'}>
                {formatFixed(last.value, 6)}
            </span>
            <span className={'value-primary'} key={'smoothed'}>
                {formatFixed(last.smoothed, 6)}
            </span>
        </span>
    } else {
        value = <span className={'value primary-only'} style={{width: `${titleWidth}px`}}>
            <span className={'value-primary'} key={'value'}>
                {formatFixed(last.value, 6)}
            </span>
        </span>
    }
    return <ListGroup.Item className={'sparkline-list-item'} action={props.onClick != null} onClick={props.onClick}>
        <span style={{color: props.color, width: `${titleWidth}px`}}>{props.name}</span>
        <svg className={'sparkline'}
             height={25} width={chartWidth}>
            <g transform={`translate(${0}, 25)`}>
                <LinePlot series={s} xScale={xScale} yScale={yScale} color={'#7f8c8d'}/>
            </g>
        </svg>
        {value}
        {/*<clipPath id={`clip-${props.name}`}>*/}
        {/*    <rect width={100} height={20}/>*/}
        {/*</clipPath>*/}
    </ListGroup.Item>
}
