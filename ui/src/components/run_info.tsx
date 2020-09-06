import React from "react";
import "./run_info.scss"
import {Status, getTimeDiff, StatusView, formatTime} from "./utils"


interface RunInfoProps {
    name: string
    comment: string
    status: Status
    width: number
    start: number
    time: number
}

export function RunInfo(props: RunInfoProps) {
    let style = {
        width: `${props.width}px`
    }

    return <div className={'run-info'} style={style}>
        <div className={'last-updated'}>Last updated {getTimeDiff(props.time)}</div>
        <StatusView status={props.status}/>
        <h3>{props.name}</h3>
        <h5>{props.comment}</h5>
        <div>
            <label>Started {formatTime(props.start)}</label>
        </div>
    </div>
}
