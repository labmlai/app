import React from "react"

import {useHistory} from "react-router-dom"

import './back_button.scss'

interface BasicViewProps {
    onButtonClick?: () => void
}

export function BackButton(props: BasicViewProps) {
    const history = useHistory()

    function onBackButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        history.goBack()
    }

    return <div className={'mt-2'}>
        <button onClick={onBackButtonClick} className={'back_button'}>{'<Back'}</button>
    </div>
}