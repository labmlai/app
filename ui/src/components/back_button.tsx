import React, {useEffect, useState} from "react"

import {useHistory, useLocation} from "react-router-dom"

import './back_button.scss'

interface BasicViewProps {
    onButtonClick?: () => void
}

export function BackButton(props: BasicViewProps) {
    const history = useHistory()
    const location = useLocation()

    const [isPrevious, setIsPrevious] = useState(false)
    const [text, setText] = useState('')

    useEffect(() => {
        setText('Home')

        let previous_path = location.state
        if (previous_path) {
            if (previous_path === '/run') {
                setText('Run')
            }
            setIsPrevious(true)
        }

    }, [])


    function onBackButtonClick() {
        if (props.onButtonClick) {
            props.onButtonClick()
        }

        if (isPrevious) {
            history.goBack()
        } else {
            history.push('/home')
        }
    }

    return <div className={'mt-2'}>
        <button onClick={onBackButtonClick} className={'back_button'}>{`<${text}`}</button>
    </div>
}