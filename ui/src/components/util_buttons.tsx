import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import {Nav} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronLeft, faSync} from "@fortawesome/free-solid-svg-icons"

import "./util_buttons.scss"
import {Status} from "../models/run";
import CACHE from "../cache/cache";

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
    const runCache = CACHE.getRun(props.runUUID)
    const [status, setStatus] = useState(null as unknown as Status)

    useEffect(() => {
        async function load() {
            setStatus(await runCache.getStatus())
        }

        load().then()
    }, [runCache])


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