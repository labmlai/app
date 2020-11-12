import React from 'react'

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import Lottie from 'lottie-react-web'
import animation from '../assets/lottie/Chemical.json'
import {Button} from "react-bootstrap"

import useWindowDimensions from "../utils/window_dimensions"



function PageNotFound() {
    mixpanel.track('404')
    const history = useHistory()
    const {width: windowWidth} = useWindowDimensions()

    function onButtonClick() {
        history.push('/home')
    }

    return <div className={'container'}>
        <div className={'text-center mt-5'}>
            <div style={{width: Math.min(windowWidth, 500), margin: '0 auto'}}>
                <Lottie options={{animationData: animation}}/>
            </div>
            <h1 className={'text-danger'}>404 - Not found error</h1>
            <h3>Page your are looking for was not found</h3>
            <Button onClick={onButtonClick}>Go to Home</Button>
        </div>
    </div>
}

export default PageNotFound
