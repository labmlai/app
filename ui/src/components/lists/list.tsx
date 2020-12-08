import React, {useState} from "react"

import {useHistory} from "react-router-dom"

import {ListGroup} from "react-bootstrap"

import {formatTime} from "../../utils/time"
import {StatusView} from "../../utils/status"

import "./list.scss"

interface ListItemProps {
    idx: number
    item: any
    isEditMode?: boolean
    itemKey: string
    onItemClick: (e: any, UUID: string) => void
}

export function ListItem(props: ListItemProps) {
    const history = useHistory()
    const [isClicked, setIsClicked] = useState(false)

    const item = props.item
    const uuidKey = `${props.itemKey}_uuid`

    let onClick = null
    if (props.isEditMode && props.onItemClick) {
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