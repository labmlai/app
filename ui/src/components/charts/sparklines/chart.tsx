import React from "react"

import {ListGroup} from "react-bootstrap"

import {defaultSeriesToPlot, getExtent} from "../utils"
import {SparkLine} from "./sparkline"
import {getColor} from "../constants"
import {SeriesProps} from "../types"
import {SeriesModel} from "../../../models/run"
import {LabLoader} from "../../utils/loader"

function SparkLines(props: SeriesProps) {
    const windowWidth = props.width
    const margin = Math.floor(windowWidth / 64)

    let track = props.series

    let lastValues: number[] = []
    for (let s of track) {
        let series = s.series
        lastValues.push(series[series.length - 1].value)
    }

    let maxLastValue = Math.max(...lastValues)
    let minLastValue = Math.min(...lastValues)

    const stepExtent = getExtent(track.map(s => s.series), d => d.step)
    const rowWidth = Math.min(450, windowWidth - 3 * margin)

    let colorIndices: number[] = []
    for (let i = 0; i < props.plotIdx.length; i++) {
        if (props.plotIdx[i] >= 0) {
            colorIndices.push(i)
        } else {
            colorIndices.push(-1)
        }
    }

    let sparkLines = track.map((s, i) => {
        let onClick
        if (props.onSelect != null) {
            onClick = props.onSelect.bind(null, i)
        }
        return <SparkLine key={s.name} name={s.name} series={s.series} selected={props.plotIdx[i]}
                          stepExtent={stepExtent} width={rowWidth} onClick={onClick} minLastValue={minLastValue}
                          maxLastValue={maxLastValue} color={getColor(colorIndices[i])} currentX={props.currentX}/>
    })

    return <ListGroup className={'sparkline-list'}>
        {sparkLines}
    </ListGroup>
}


export function getSparkLines(track: SeriesModel[] | null, plotIdx: number[] | null,
                              width: number, onSelect?: ((i: number) => void), currentX?: number| null) {
    if (track != null) {
        if (track.length === 0) {
            return null
        }
        if (plotIdx == null) {
            plotIdx = defaultSeriesToPlot(track)
        }

        return <SparkLines series={track} width={width} plotIdx={plotIdx} onSelect={onSelect} currentX={currentX}/>
    } else {
        return <LabLoader/>
    }
}