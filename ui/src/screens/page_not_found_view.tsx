import React from 'react'
import Lottie from 'lottie-react-web'
import animation from '../assets/lottie/Chemical.json'
import {Button} from "react-bootstrap"
import useWindowDimensions from "../utils/window_dimensions";
import {useHistory} from "react-router-dom";


function PageNotFound() {
    const history = useHistory()
    const {width: windowWidth} = useWindowDimensions()

    function onButtonClick() {
            history.push('/home')
    }

    return <div className={'container'}>
        <div className={'text-center mt-5'}>
            <h1 className={'display-1 text-danger'}>404</h1>
            <h1 className={'text-primary'}>ERROR - LAB EXPLOSION</h1>
            <Lottie style={{width: Math.min(windowWidth, 500), margin: '0 auto'}}
                    options={{
                        animationData: animation
                    }}
            />
            <Button className='button-theme' onClick={onButtonClick}>Go to Home</Button>
        </div>
    </div>
}

export default PageNotFound
