import React from "react";
import {RunStatusModel} from "../models/run";

export interface StatusProps {
    status: RunStatusModel
    lastUpdatedTime?: number
}

export function StatusView(props: StatusProps) {
    let status = props.status

    if (status.status === 'in progress') {
        return <div className={'status text-info'}>experiment is running</div>
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