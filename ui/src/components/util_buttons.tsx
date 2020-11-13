import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronLeft, faSync, faTrash} from "@fortawesome/free-solid-svg-icons"

import {Status} from "../models/status"
import CACHE from "../cache/cache"

import "./util_buttons.scss"

interface ButtonProps {
    onButtonClick?: () => void
}

export function BackButton(props: ButtonProps) {
    const history = useHistory()
    const location = useLocation()

    const [isPrevious, setIsPrevious] = useState(false)
    const [text, setText] = useState('')

    useEffect(() => {
        setText('Home')

        let previous_path = location.state
        if (previous_path) {
            if (previous_path === '/run') {
                setText('Run')
            }
            setIsPrevious(true)
        }

    }, [location])


    function onBackButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        if (isPrevious) {
            history.goBack()
        } else {
            history.push('/home')
        }
    }

    return <Nav.Link className={'tab'} onClick={onBackButtonClick}>
        <FontAwesomeIcon icon={faChevronLeft}/>
        <span>{text}</span>
    </Nav.Link>
}

interface RefreshButtonProps extends ButtonProps {
    runUUID: string
}

export function RefreshButton(props: RefreshButtonProps) {
    const statusCache = CACHE.getStatus(props.runUUID)
    const [status, setStatus] = useState(null as unknown as Status)

    useEffect(() => {
        async function load() {
            setStatus(await statusCache.get())
        }

        load().then()
    }, [statusCache])


    function onRefreshButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }
    }

    return <div className={'d-inline'}>
        {status && status.isRunning &&
        <Nav.Link className={'tab refresh float-right'} onClick={onRefreshButtonClick}>
            <FontAwesomeIcon icon={faSync}/>
        </Nav.Link>
        }
    </div>
}

export function DeleteButton(props: ButtonProps) {
    return <div>
            <Nav.Link className={'float-right mb-3'} onClick={props.onButtonClick}>
                <FontAwesomeIcon icon={faTrash}/>
            </Nav.Link>
        </div>
}