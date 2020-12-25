import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faChevronLeft, faSync, faTrash, faEdit, faSave, faTimes} from "@fortawesome/free-solid-svg-icons"

import "./util_buttons.scss"

interface ButtonProps {
    onButtonClick?: () => void
    isDisabled?: boolean
    parent: string
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
            } else if (previous_path === '/computer') {
                setText('Computer')
            }

            if (previous_path !== '/login') {
                setIsPrevious(true)
            }
        }

    }, [location])


    function onBackButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        if (isPrevious) {
            history.goBack()
        } else {
            // let uri = location.pathname + location.search
            //history.push('/runs', uri)
            history.push('/runs')
        }

        mixpanel.track('Back Button Clicked', {parent: props.parent})
    }

    return <Nav.Link className={'tab'} onClick={onBackButtonClick}>
        <FontAwesomeIcon icon={faChevronLeft}/>
        <span>{text}</span>
    </Nav.Link>
}

export function RefreshButton(props: ButtonProps) {
    function onRefreshButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Refresh Button Clicked', {parent: props.parent})
    }

    return <Nav.Link className={'tab float-right'} onClick={onRefreshButtonClick}>
        <FontAwesomeIcon icon={faSync}/>
    </Nav.Link>
}

export function DeleteButton(props: ButtonProps) {
    function onDeleteButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Delete Button Clicked', {parent: props.parent})
    }

    return <Nav.Link className={'tab float-right'} onClick={onDeleteButtonClick}>
        <FontAwesomeIcon icon={faTrash}/>
    </Nav.Link>
}

export function EditButton(props: ButtonProps) {
    function onEditButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Edit Button Clicked', {parent: props.parent})
    }

    return <Nav.Link className={'tab float-right'} onClick={onEditButtonClick}>
        <FontAwesomeIcon icon={faEdit}/>
    </Nav.Link>
}

export function SaveButton(props: ButtonProps) {
    function onSaveButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Save Button Clicked', {parent: props.parent})
    }

    return <Nav.Link onClick={onSaveButtonClick} className={'tab float-right'} disabled={props.isDisabled}>
        <FontAwesomeIcon icon={faSave}/>
    </Nav.Link>
}

export function CancelButton(props: ButtonProps) {
    function onCancelButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Cancel Button Clicked', {parent: props.parent})
    }

    return <Nav.Link onClick={onCancelButtonClick} className={'tab float-right'} disabled={props.isDisabled}>
        <FontAwesomeIcon icon={faTimes}/>
    </Nav.Link>
}