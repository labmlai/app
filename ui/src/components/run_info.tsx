import React, {FunctionComponent} from "react";
import "./run_info.scss"
import {formatTime} from "./utils"
import {Status} from "./models";
import {StatusView} from "./status"

interface RunInfoProps {
    uuid: string
    name: string
    comment: string
    status: Status
    start: number
    lastUpdatedTime: number
}

const RunInfo: FunctionComponent<RunInfoProps> = (props: RunInfoProps) => {
    return <div className={'run-info labml-card'}>
        <StatusView status={props.status} lastUpdatedTime={props.lastUpdatedTime}/>
        <h3>{props.name}</h3>
        <h5>{props.comment}</h5>
        <div className={"run-uuid"}><span role={'img'} aria-label={'running'}>📌 UUID:</span>{props.uuid}</div>
        <div className={'start-time'}>Started {formatTime(props.start)}</div>
    </div>
}

// RunInfo.defaultProps = {
//     showLastUpdated: true
// };

export {RunInfo}