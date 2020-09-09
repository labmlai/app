import React from "react";
import {Status} from "./models";

export function formatTime(time: number): string {
    let date = new Date(time * 1000)
    let timeStr = date.toTimeString().substr(0, 8)
    let dateStr = date.toDateString()
    return `on ${dateStr} at ${timeStr}`
}


export function getTimeDiff(timestamp: number): string {
    let timeDiff = (Date.now() / 1000 - timestamp) / 60

    if (timeDiff < 1) {
        return "less than a minute ago"
    } else if (timeDiff < 10) {
        return `${Math.round(timeDiff)} minutes ago`
    } else {
        return formatTime(timestamp)
    }
}

export function StatusView(props: { status: Status }) {
    if (props.status.status === 'in progress') {
        return <div className={'badge badge-info'}>🏃 experiment is running</div>
    } else {
        return <div className={'badge badge-info'}>{props.status.status}</div>
    }
}