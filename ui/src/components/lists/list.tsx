import React, {useState} from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {formatTime} from "../../utils/time"
import {StatusView} from "../../utils/status"
import {DeleteButton, EditButton, RefreshButton} from "../utils/util_buttons"

import "./list.scss"

interface ListItemProps {
    idx: number
    item: any
    isEditMode: boolean
    itemKey: string
    onItemClick: (e: any, UUID: string) => void
}

function ListItem(props: ListItemProps) {
    const history = useHistory()
    const [isClicked, setIsClicked] = useState(false)

    const item = props.item
    const uuidKey = `${props.itemKey}_uuid`

    let onClick = null
    if (props.isEditMode) {
        onClick = (e: any) => {
            props.onItemClick(e, item[uuidKey])
            setIsClicked(!isClicked)
        }
    } else {
        onClick = () => {
            history.push(`/${props.itemKey}?${uuidKey}=${item[uuidKey]}`, history.location.pathname)
        }
    }

    let className = 'list-item'
    if (isClicked) {
        className += ' selected'
    }

    return <ListGroup.Item className={className} action>
        <div onClick={onClick}>
            <StatusView status={item.run_status}/>
            <p>Started on {formatTime(item.start_time)}</p>
            <h5>{item.name}</h5>
            <h6>{item.comment}</h6>
        </div>
    </ListGroup.Item>
}

interface ListProps {
    items: any[]
    itemKey: string
    onDelete?: (itemsList: Set<string>) => void
    onRefresh?: () => void
}

export function List(props: ListProps) {
    const [isEditMode, setIsEditMode] = useState(false)

    const uuidKey = `${props.itemKey}_uuid`

    let itemDeleteSet = new Set<string>()

    function onItemClick(e: any, UUID: string) {
        if (itemDeleteSet.has(UUID)) {
            itemDeleteSet.delete(UUID)
        } else {
            itemDeleteSet.add(UUID)
        }
    }

    function onDelete() {
        if (props.onDelete) {
            props.onDelete(itemDeleteSet)
        }
        setIsEditMode(false)
    }

    function onEdit() {
        setIsEditMode(true)
    }

    return <ListGroup className={"list"}>
        <div className={'flex-container mb-2'}>
            {props.onDelete && isEditMode && <DeleteButton onButtonClick={onDelete}/>}
            {props.onDelete && !isEditMode && <EditButton onButtonClick={onEdit}/>}
            <RefreshButton onButtonClick={props.onRefresh}/>
        </div>
        {props.items.map((item, idx) => (
            <ListItem key={item[uuidKey]} idx={idx} item={item} onItemClick={onItemClick}
                      isEditMode={isEditMode} itemKey={props.itemKey}/>
        ))}
    </ListGroup>
}