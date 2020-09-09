import React, {FunctionComponent} from "react";
import "./run_info.scss"
import {formatTime, getTimeDiff} from "./utils"
import {Status} from "./models";
import {StatusView} from "./status"

interface RunInfoProps {
    name: string
    comment: string
    status: Status
    start: number
    lastUpdatedTime: number
    showLastUpdated?: boolean
}

const RunInfo: FunctionComponent<RunInfoProps> = (props: RunInfoProps) => {
    let lastUpdated = null
    if (props.showLastUpdated) {
        lastUpdated = <div className={'last-updated'}>Last updated {getTimeDiff(props.lastUpdatedTime)}</div>
    }

    return <div className={'run-info'}>
        {lastUpdated}
        <StatusView status={props.status} lastUpdatedTime={props.lastUpdatedTime}/>
        <h3>{props.name}</h3>
        <h5>{props.comment}</h5>
        <div>
            <label>Started {formatTime(props.start)}</label>
        </div>
    </div>
}

RunInfo.defaultProps = {
    showLastUpdated: true
};

export {RunInfo}