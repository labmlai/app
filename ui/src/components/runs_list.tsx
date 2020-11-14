import React from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {RunListItemModel} from "../models/run_list"
import {formatTime} from "./utils"
import {StatusView} from "./status"
import {DeleteButton} from "./util_buttons"

import "./runs_list.scss"


interface RunsListProps {
    runs: RunListItemModel[]
    onDelete?: (runList: Set<string>) => void
}

interface RunsListItemProps {
    idx: number
    run: RunListItemModel
    onCheckBoxClick: (e: any, runUUID: string) => void
}

function RunsListItem(props: RunsListItemProps) {
    const history = useHistory()

    const run = props.run
    return <ListGroup.Item className={'runs-list-item'} action>
        <input type={'checkbox'} className={'float-right'}
               onChange={(e: any) => props.onCheckBoxClick(e, run.run_uuid)}/>
        <div onClick={() => {
            history.push(`/run?run_uuid=${run.run_uuid}`, history.location.pathname)
        }}>
            <StatusView status={run.run_status}/>
            <p>Started on {formatTime(run.start_time)}</p>
            <h5>{run.name}</h5>
            <h6>{run.comment}</h6>
        </div>
    </ListGroup.Item>
}

export function RunsList(props: RunsListProps) {
    let runDeleteSet = new Set<string>()

    function onCheckBoxClick(e: any, runUUId: string) {
        if (runDeleteSet.has(runUUId)) {
            runDeleteSet.delete(runUUId)
        } else {
            runDeleteSet.add(runUUId)
        }
    }

    function onDelete() {
        if (props.onDelete) {
            props.onDelete(runDeleteSet)
        }
    }

    return <ListGroup className={"runs-list"}>
        <DeleteButton onButtonClick={onDelete}/>
        {props.runs.map((run, idx) => (
            <RunsListItem key={idx} idx={idx} run={run} onCheckBoxClick={onCheckBoxClick}/>
        ))}
    </ListGroup>
}