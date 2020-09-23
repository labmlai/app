import React from "react"
import {useHistory} from "react-router-dom";
import "./runs_list.scss"
import {ListGroup} from "react-bootstrap"
import {Run} from "./models";
import {formatTime} from "./utils";
import {StatusView} from "./status";


interface RunsListProps {
    runs: Run[]
}

interface RunsListItemProps {
    idx: number
    run: Run
}

function RunsListItem(props: RunsListItemProps) {
    const history = useHistory();

    const run = props.run
    return <ListGroup.Item action className={'runs-list-item'} onClick={() => {
        history.push(`/run?run_uuid=${run.run_uuid}`);
    }}
    >
        <div>
        <StatusView status={run.status} lastUpdatedTime={run.time}/>
        <p>Started on {formatTime(run.start)}</p>
        <h5>{run.name}</h5>
        <h6>{run.comment}</h6>
            </div>
    </ListGroup.Item>
}

export function RunsList(props: RunsListProps) {
    return <ListGroup className={"runs-list"}>
        {props.runs.map((run, idx) => (
            <RunsListItem key={idx} idx={idx} run={run}/>
        ))}
    </ListGroup>
}