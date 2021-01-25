import React from "react"

import {Alert} from "react-bootstrap"

import "./alert.scss"

interface MessageProps {
    children: any
    onClick?: () => void
}

export function WarningMessage(props: MessageProps) {
    let cursor = props.onClick ? ' cursor' : ''
    return <Alert className={'text-center text-info mt-1' + cursor} variant={'warning'}
                  onClick={props.onClick}>
        {props.children}
    </Alert>
}

export function ErrorMessage(props: MessageProps) {
    return <Alert className={'text-center text-info mt-1'} variant={'danger'}>
        {props.children}
    </Alert>
}

