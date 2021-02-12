import React from "react"

import {RunStatusModel} from "../models/status"

interface StatusProps {
    status: RunStatusModel
    lastUpdatedTime?: number
    type?: string
}

export function StatusView(props: StatusProps) {
    let status = props.status

    if (status.status === 'in progress') {
        if (props.type === 'run') {
            return <div className={'status text-info text-uppercase'}>experiment is running</div>
        } else if (props.type === 'computer' || props.type === 'session') {
            return <div className={'status text-info text-uppercase'}>computer is monitoring</div>
        } else {
            return <div className={'status text-info text-uppercase'}>experiment is running</div>
        }
    } else if (status.status === 'no response') {
        return <div className={'status text-warning text-uppercase'}>no response</div>
    } else if (status.status === 'completed') {
        return <div className={'status text-success text-uppercase'}>completed</div>
    } else if (status.status === 'crashed') {
        return <div className={'status text-danger text-uppercase'}>crashed</div>
    } else if (status.status === 'unknown') {
        return <div className={'status text-uppercase'}>{'Unknown Status'}</div>
    } else {
        return <div className={'status'}>{status.status}</div>
    }
}

export interface BadgeViewProps {
    text: string
}

export function BadgeView(props: BadgeViewProps) {
    return <div className="label label-info mr-3">{props.text}</div>
}