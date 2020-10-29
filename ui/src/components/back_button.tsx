import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import {Nav} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";

interface BasicViewProps {
    onButtonClick?: () => void
}

export function BackButton(props: BasicViewProps) {
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

    }, [])


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

    return <div className={'flex-container'}>
        <Nav.Link eventKey="second" className={'tab'} onClick={onBackButtonClick}>
            <FontAwesomeIcon icon={faChevronLeft}/>
            <span>{text}</span>
        </Nav.Link>
    </div>
}