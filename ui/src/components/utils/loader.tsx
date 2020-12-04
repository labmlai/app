import React from "react"

import {Spinner} from "react-bootstrap"

import './loader.scss'

export function LabLoader() {
    return <div className={'loader'}>
        <Spinner animation="border" style={{color: "#eb6134"}}/>
    </div>
}