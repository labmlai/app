import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
    faChevronLeft,
    faSync,
    faTrash,
    faEdit,
    faSave,
    faTimes,
} from "@fortawesome/free-solid-svg-icons"

import {experiment_analyses, computer_analyses} from "../../analyses/all_analyses"

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
    const [syntheticPath, setSyntheticPath] = useState('')
    const [text, setText] = useState('')

    useEffect(() => {
        let previous_path = location.state
        if (previous_path) {
            if (previous_path === '/run') {
                setText('Run')
            } else if (previous_path === '/session') {
                setText('Computer')
            } else if (previous_path === '/runs') {
                setText('Runs')
            } else if (previous_path === '/computers') {
                setText('Computers')
            }

            if (previous_path !== '/login') {
                setIsPrevious(true)
            }
        } else if (location.pathname === '/run') {
            setText('Runs')
            setSyntheticPath('/runs')
        } else if (location.pathname === '/session') {
            setText('Computers')
            setSyntheticPath('/computers')
        } else {
            for (let i = 0; i < experiment_analyses.length; i++) {
                if (location.pathname === '/' + experiment_analyses[i].route) {
                    setText('Run')
                    setSyntheticPath('/run' + location.search)
                    break
                }
            }

            for (let i = 0; i < computer_analyses.length; i++) {
                if (location.pathname === '/' + computer_analyses[i].route) {
                    setText('Computer')
                    setSyntheticPath('/computer' + location.search)
                    break
                }
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
            if (syntheticPath) {
                history.push(syntheticPath)
            } else {
                history.push('/runs')
            }
        }

        mixpanel.track('Back Button Clicked', {parent: props.parent})
    }

    return <Nav.Link className={'tab'} onClick={onBackButtonClick}>
        <FontAwesomeIcon icon={faChevronLeft}/>
        <span className={'ml-1'}>{text}</span>
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

interface ToggleButtonProps extends ButtonProps {
    isToggled: boolean
}

export function ToggleButton(props: ToggleButtonProps) {
    function onToggleButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        mixpanel.track('Toggle Button Clicked', {parent: props.parent})
    }

    return <label className="switch">
        <input type="checkbox" onClick={onToggleButtonClick}/>
        <span className="slider round"/>
    </label>

}