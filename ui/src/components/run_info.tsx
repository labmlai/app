import React from "react";
import "./run_info.scss"

interface Status {
    status: string
    time: number
    details: string
}

interface RunInfoProps {
    name: string
    comment: string
    status: Status
    width: number
    start: number
    time: number
}

function formatTime(time: number): string {
    let date = new Date(time * 1000)
    let timeStr = date.toTimeString().substr(0, 8)
    let dateStr = date.toDateString()
    return `on ${dateStr} at ${timeStr}`
}


function getTimeDiff(timestamp: number): string {
    let timeDiff = (Date.now() / 1000 - timestamp) / 60

    if (timeDiff < 1) {
        return "less than a minute ago"
    } else if (timeDiff < 10) {
        return `${Math.round(timeDiff)} minutes ago`
    } else {
        return formatTime(timestamp)
    }
}

function StatusView(props: { status: Status }) {
    if (props.status.status === 'in progress') {
        return <div className={'badge badge-info'}>🏃 experiment is running</div>
    } else {
        return <div className={'badge badge-info'}>{props.status.status}</div>
    }
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
