import React from "react"

import {useHistory} from "react-router-dom"

import './back_button.scss'

export function BackButton() {
    const history = useHistory()

    return <div className={'mt-2'}>
        <button onClick={history.goBack} className={'back_button'}>{'<Back'}</button>
    </div>
}