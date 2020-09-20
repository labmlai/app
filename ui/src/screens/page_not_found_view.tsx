import React from 'react'
import Lottie from 'lottie-react-web'
import animation from '../assets/lottie/astronaout.json'


function PageNotFound() {
    return <div className={'container text-center mt-5'}>
        <h1 className={'text-secondary'}>SORRY, WE COULDN'T FIND THE SPACE</h1>
        <Lottie style={{width: 400, margin: '0 auto'}}
                options={{
                    animationData: animation
                }}
        />
    </div>
}

export default PageNotFound
