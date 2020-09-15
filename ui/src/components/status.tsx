import {Status} from "./models";
import React from "react";

export interface StatusProps {
    status: Status
    lastUpdatedTime?: number
}

export function getActualStatus(status: Status, lastUpdatedTime?: number) {
    let notResponding = false

    if (status.status === 'in progress') {
        if (lastUpdatedTime != null) {
            let timeDiff = (Date.now() / 1000 - lastUpdatedTime) / 60
            if (timeDiff > 15) {
                notResponding = true
            }
        }
    }

    if (notResponding) {
        return {status: 'no response', details: status.details, time: status.time}
    } else if (status.status == null) {
        return {status: 'unknown', details: status.details, time: status.time}
    } else {
        return status
    }
}

export function StatusView(props: StatusProps) {
    let status = getActualStatus(props.status, props.lastUpdatedTime)
    if (status.status === 'in progress') {
        return <div className={'badge badge-info'}>
            <span role={'img'} aria-label={'running'}>🏃</span> experiment is running</div>
    } else if (status.status === 'no response') {
        return <div className={'status text-warning'}>no response</div>
    } else if (status.status === 'completed') {
        return <div className={'status text-success'}>completed</div>
    } else if (status.status === 'crashed') {
        return <div className={'status text-danger'}>crashed</div>
    } else if (status.status === 'unknown') {
        return <div className={'status'}>{'Unknown Status'}</div>
    } else {
        return <div className={'status'}>{status.status}</div>
    }
}

function StatusBadgeView(props: StatusProps) {
    let status = getActualStatus(props.status, props.lastUpdatedTime)
    if (status.status === 'in progress') {
        return <div className={'badge badge-info'}>
            <span role={'img'} aria-label={'running'}>🏃</span> experiment is running</div>
    } else if (status.status === 'no response') {
        return <div className={'badge badge-warning'}>no response</div>
    } else if (status.status === 'unknown') {
        return <div className={'status'}>{'Unknown Status'}</div>
    } else {
        return <div className={'badge badge-info'}>{status.status}</div>
    }
}