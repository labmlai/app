import React from 'react'
import Lottie from 'lottie-react-web'
import animation from '../assets/lottie/Chemical.json'


function PageNotFound() {
    return <div className={'container'}>
        <div className={'mt-5 text-center'}>
            <h1 className={'display-1 text-danger'}>404</h1>
            <h1 className={'text-primary'}>ERROR - LAB EXPLOSION</h1>
        </div>
        <Lottie style={{width: 500}}
                options={{
                    animationData: animation
                }}
        />
    </div>
}

export default PageNotFound
