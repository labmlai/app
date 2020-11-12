import React from "react"

import {ListGroup} from "react-bootstrap"

import {PointValue} from "../../models/run"
import {formatFixed, pickHex, scaleValue} from "../value"
import {getExtent, getScale} from "./utils"
import {LinePlot} from "./line_plot"
import {BASE_COLOR} from "./constants"

interface SparkLineProps {
    name: string
    series: PointValue[]
    width: number
    stepExtent: [number, number]
    selected: number
    minLastValue: number
    maxLastValue: number
    onClick?: () => void
    color: string
}

export function SparkLine(props: SparkLineProps) {
    let color = BASE_COLOR
    if (props.selected >= 0) {
        color = props.color
    }

    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth * 2

    const s = props.series
    const yScale = getScale(getExtent([s], d => d.value, true), -25)
    const xScale = getScale(props.stepExtent, chartWidth)

    const last = s[s.length - 1]

    let lastValue = scaleValue(last.value, props.minLastValue, props.maxLastValue)
    let valueColor = pickHex(lastValue)

    let value
    if (Math.abs(last.value - last.smoothed) > last.value / 1e6) {
        value = <span className={'value'} style={{width: `${titleWidth}px`}}>
            <span className={'value-secondary'} key={'value'} style={{color: valueColor}}>
                {formatFixed(last.value, 6)}
            </span>
            <span className={'value-primary'} key={'smoothed'} style={{color: valueColor}}>
                {formatFixed(last.smoothed, 6)}
            </span>
        </span>
    } else {
        value = <span className={'value primary-only'} style={{width: `${titleWidth}px`}}>
            <span className={'value-primary'} key={'value'} style={{color: valueColor}}>
                {formatFixed(last.value, 6)}
            </span>
        </span>
    }
    let className = 'sparkline-list-item'
    if (props.onClick != null && props.selected >= 0) {
        className += ' selected'
    }

    return <ListGroup.Item className={className} action={props.onClick != null} onClick={props.onClick}>
        <div className={'sparkline-content'} style={{width: `${titleWidth * 2 + chartWidth}px`}}>
            <span style={{color: color, width: `${titleWidth}px`}}>{props.name}</span>
            <svg className={'sparkline'} height={25} width={chartWidth}>
                <g transform={`translate(${0}, 25)`}>
                    <LinePlot series={s} xScale={xScale} yScale={yScale} color={'#7f8c8d'}/>
                </g>
            </svg>
            {value}
        </div>
    </ListGroup.Item>
}
