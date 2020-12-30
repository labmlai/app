import React, {useState, useEffect} from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {formatTime} from "../../utils/time"
import {StatusView} from "../../utils/status"

import "./list.scss"

interface ListItemProps {
    item: any
    isEditMode?: boolean
    itemKey: string
    onItemClick: (e: any, UUID: string) => void
}

function ListItem(props: ListItemProps) {
    const history = useHistory()
    const [isClicked, setIsClicked] = useState(false)

    const item = props.item
    const uuidKey = `${props.itemKey}_uuid`

    let className = 'list-item'
    useEffect(() => {
        if (!props.isEditMode) {
            setIsClicked(false)
        }
    }, [props.isEditMode])

    if (isClicked && props.isEditMode) {
        className += ' selected'
    }

    let onClick: (e: any) => void
    if (props.isEditMode && props.onItemClick) {
        onClick = (e: any) => {
            props.onItemClick(e, item[uuidKey])
            setIsClicked(!isClicked)
        }
    } else {
        onClick = () => {
            history.push(`/${props.itemKey}?uuid=${item[uuidKey]}`, history.location.pathname)
        }
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
    onItemClick: (e: any, UUID: string) => void
    isEditMode: boolean
    itemKey: string
}

export function List(props: ListProps) {
    const uuidKey = `${props.itemKey}_uuid`

    return <ListGroup className={"list runs-list"}>
        {props.items.map((item, idx) => (
            <ListItem key={item[uuidKey]}
                      item={item}
                      onItemClick={props.onItemClick}
                      isEditMode={props.isEditMode} itemKey={props.itemKey}/>
        ))}
    </ListGroup>
}