import React from "react"

import {useHistory} from "react-router-dom"

import './back_button.scss'

export function BackButton() {
    const history = useHistory()

    return <div className={'mt-2'}>
        <a type={'button'} onClick={history.goBack}><span className={'back_button'}>{'<Back'}</span></a>
    </div>
}