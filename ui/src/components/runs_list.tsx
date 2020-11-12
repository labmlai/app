import React from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {RunListItemModel} from "../models/run_list"
import {formatTime} from "./utils"
import {StatusView} from "./status"

import "./runs_list.scss"


interface RunsListProps {
    runs: RunListItemModel[]
}

interface RunsListItemProps {
    idx: number
    run: RunListItemModel
}

function RunsListItem(props: RunsListItemProps) {
    const history = useHistory();

    const run = props.run
    return <ListGroup.Item action className={'runs-list-item'} onClick={() => {
        history.push(`/run?run_uuid=${run.run_uuid}`, history.location.pathname);
    }}
    >
        <div>
            <StatusView status={run.run_status}/>
            <p>Started on {formatTime(run.start_time)}</p>
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