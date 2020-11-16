import React, {useState} from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {RunListItemModel} from "../models/run_list"
import {formatTime} from "./utils"
import {StatusView} from "./status"
import {DeleteButton, EditButton} from "./util_buttons"

import "./runs_list.scss"


interface RunsListProps {
    runs: RunListItemModel[]
    onDelete?: (runList: Set<string>) => void
}

interface RunsListItemProps {
    idx: number
    run: RunListItemModel
    isEditMode: boolean
    onRunItemClick: (e: any, runUUID: string) => void
}

function RunsListItem(props: RunsListItemProps) {
    const history = useHistory()
    const [isClicked, setIsClicked] = useState(false)

    let onClick = null
    if (props.isEditMode) {
        onClick = (e: any) => {
            props.onRunItemClick(e, run.run_uuid)
            setIsClicked(!isClicked)
        }
    } else {
        onClick = () => {
            history.push(`/run?run_uuid=${run.run_uuid}`, history.location.pathname)
        }
    }

    let className = 'runs-list-item'
    if (isClicked) {
        className += ' selected'
    }

    const run = props.run
    return <ListGroup.Item className={className} action>
        <div onClick={onClick}>
            <StatusView status={run.run_status}/>
            <p>Started on {formatTime(run.start_time)}</p>
            <h5>{run.name}</h5>
            <h6>{run.comment}</h6>
        </div>
    </ListGroup.Item>
}

export function RunsList(props: RunsListProps) {
    const [isEditMode, setIsEditMode] = useState(false)

    let runDeleteSet = new Set<string>()

    function onRunItemClick(e: any, runUUId: string) {
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
        setIsEditMode(false)
    }

    function onEdit() {
        setIsEditMode(true)
    }

    return <ListGroup className={"runs-list"}>
        {props.onDelete && isEditMode && <DeleteButton onButtonClick={onDelete}/>}
        {props.onDelete && !isEditMode && <EditButton onButtonClick={onEdit}/>}
        {props.runs.map((run, idx) => (
            <RunsListItem key={run.run_uuid} idx={idx} run={run} onRunItemClick={onRunItemClick} isEditMode={isEditMode}/>
        ))}
    </ListGroup>
}