import React from "react"
import {toPointValues} from "./utils"
import {getColor} from "./constants"
import {ListGroup} from "react-bootstrap"
import {SeriesModel} from "../../models/run"

import "./style.scss"

interface BarLineProps {
    value: number
    color: string
    name: string
    width: number
}

export function BarLine(props: BarLineProps) {
    const titleWidth = Math.min(150, Math.round(props.width * .375))
    const chartWidth = props.width - titleWidth * 2

    return <ListGroup.Item className={'sparkline-list-item'}>
        <div className={'sparkline-content'} style={{width: `${titleWidth * 2 + chartWidth}px`}}>
            <span style={{color: 'rgb(52, 73, 94)', width: `${titleWidth}px`}}>{props.name}</span>
            <svg className={'sparkline'} height={40} width={chartWidth}>
                <g transform={`translate(${0}, 5)`}>
                    <rect width={props.value * chartWidth} height={25} fill={props.color} opacity={0.7}/>
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

    let track = toPointValues(props.series)

    let res: number[] = []
    for (let s of track) {
        res.push(s.mean)
    }

    let minMean: number = Math.min(...res)
    let maxMean: number = Math.max(...res)

    let barLines = track.map((s, i) => {
        return <BarLine key={i} value={(s.mean - minMean) / (maxMean - minMean)} color={getColor(i)}
                        name={s.name} width={rowWidth}/>

    })

    return <ListGroup className={'sparkline-list'}>
        {barLines}
    </ListGroup>
}

