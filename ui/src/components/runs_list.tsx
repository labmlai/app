import React from "react"
import {useHistory} from "react-router-dom";
import "./runs_list.scss"
import {ListGroup} from "react-bootstrap"
import {Run} from "./models";
import {getActualStatus, StatusProps} from "./status";
import {formatTime} from "./utils";


interface RunsListProps {
    runs: Run[]
}

interface RunsListItemProps {
    idx: number
    run: Run
}

export function StatusView(props: StatusProps) {
    let status = getActualStatus(props.status, props.lastUpdatedTime)
    if (status.status === 'in progress') {
        return <div className={'badge badge-info'}>🏃 experiment is running</div>
    } else if (status.status === 'no response') {
        return <div className={'status'}>no response</div>
    } else if (status.status === 'unknown') {
        return <div className={'status'}>{'Unknown Status'}</div>
    } else {
        return <div className={'status'}>{status}</div>
    }
}

function RunsListItem(props: RunsListItemProps) {
    const history = useHistory();

    const run = props.run
    return <ListGroup.Item action className={'runs-list-item'} onClick={() => {
        history.push(`/run?run_uuid=${run.run_uuid}`);
    }}
    >
        <StatusView status={run.status} lastUpdatedTime={run.time}/>
        <p>Started on {formatTime(run.start)}</p>
        <h5>{run.name}</h5>
        <h6>{run.comment}</h6>
    </ListGroup.Item>
}

export function RunsList(props: RunsListProps) {
    return <ListGroup className={"runs-list"}>
        {props.runs.map((run, idx) => (
            <RunsListItem key={idx} idx={idx} run={run}/>
        ))}
    </ListGroup>
}