import React from 'react'
import Lottie from 'lottie-react-web'
import animation from '../assets/lottie/Chemical.json'
import useWindowDimensions from "../utils/window_dimensions";


function PageNotFound() {
    const {width: windowWidth} = useWindowDimensions()

    return <div className={'container'}>
        <div className={'text-center mt-5'}>
            <h1 className={'display-1 text-danger'}>404</h1>
            <h1 className={'text-primary'}>ERROR - LAB EXPLOSION</h1>
            <Lottie style={{width: Math.min(windowWidth, 500), margin: '0 auto'}}
                    options={{
                        animationData: animation
                    }}
            />
        </div>
    </div>
}

export default PageNotFound
