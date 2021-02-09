import React from 'react'

import {useHistory} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import {Button} from "react-bootstrap"

import './page_not_found_view.scss'

function PageNotFound() {
    mixpanel.track('404')
    const history = useHistory()

    function onButtonClick() {
        history.push('/runs')
    }

    return <div className={'error-container'}>
            <h2 className={'mt-5'}>Ooops! Page not found.</h2>
            <h1>404</h1>
            <p>We can't find the page.</p>
            <Button className={'mt-3'} onClick={onButtonClick}>Go Back to Home</Button>
    </div>
}

export default PageNotFound
