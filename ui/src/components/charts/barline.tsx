import React from "react"
import {getColor} from "./constants"
import {ListGroup} from "react-bootstrap"
import {SeriesModel} from "../../models/run"

import "./style.scss"

interface BarLineProps {
    value: number
    color: string
    width: number
}

export function BarLine(props: BarLineProps) {
    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth

    return <ListGroup.Item className={'sparkline-list-item'}>
        <div className={'sparkline-content'} style={{width: `${titleWidth + chartWidth}px`}}>
            <svg className={'sparkline'} height={15} width={chartWidth}>
                <g>
                    <rect width={props.value * chartWidth} height={15} fill={props.color} opacity={0.7}/>
                </g>
            </svg>
        </div>
    </ListGroup.Item>
}

interface BarLinesProps {
    series: SeriesModel[]
    width: number
}

export function BarLines(props: BarLinesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    const rowWidth = Math.min(450, windowWidth - 3 * margin)

    let res: any = []
    let values: number[] = []
    for (let s of props.series) {
        res.push({'mean': s.mean, 'name': s.name})
        values.push(s.mean)
    }

    let sortedRes: [] = res.sort((n1: any, n2: any) => n1.mean - n2.mean);

    let minMean: number = Math.min(...values)
    let maxMean: number = Math.max(...values)

    let barLines = sortedRes.map((s: any, i) => {
        let color = s.name.includes('weight') ? getColor(2) : getColor(0)
        return <BarLine key={i} value={(s.mean - minMean) / (maxMean - minMean)} color={color} width={rowWidth}/>
    })

    return <ListGroup className={'sparkline-list'}>
        {barLines}
    </ListGroup>
}

