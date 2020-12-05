import React, {useEffect, useRef} from 'react'

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import lottie from 'lottie-web'
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

    const lottieElement = useRef(null) as any

    useEffect(() => {
        lottie.loadAnimation({
            container: lottieElement.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animation
        })
    }, [lottieElement])

    return <div className={'container'}>
        <div className={'text-center mt-1'}>
            <h1 className={'text-danger display-4'}>ERROR #404</h1>
            <div style={{width: Math.min(windowWidth, 500), margin: '0 auto'}}>
                <div style={{width: 400, margin: '0 auto'}} ref={lottieElement}/>
            </div>
            <h3 className={'text-secondary'}>OOPS! - Could not Find it</h3>
            <Button className={'mt-2'} onClick={onButtonClick}>Go Back to Home</Button>
        </div>
    </div>
}

export default PageNotFound
