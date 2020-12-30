import React, {ReactElement, useState} from "react"

import {useHistory} from "react-router-dom"

import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faRunning, faUserCircle, faBook, faComments, faBars} from "@fortawesome/free-solid-svg-icons"
import "./hamburger_menu.scss"

interface HamburgerMenuBarProps {
    title: string
    children: ReactElement | never[]
}

function HamburgerMenuBar(props: HamburgerMenuBarProps) {
    const [navLinksClass, setNavLinksClass] = useState('')
    const [overlayClass, setOverlayClass] = useState('')

    const history = useHistory()

    function clickHandle(e: Event, tab: string) {
        // setCurrentTab(tab)
        e.preventDefault()
        if (tab === 'Runs') {
            history.push('/runs')
        } else if ('User Profile') {
            history.push('/user')
        }
        onBurgerClick()
    }

    function onBurgerClick() {
        // Toggle Nav
        if (navLinksClass) {
            setNavLinksClass('')
        } else {
            setNavLinksClass(' nav-active')
        }

        // turn on overlay
        if (overlayClass) {
            setOverlayClass('')
        } else {
            setOverlayClass(' d-block')
        }
    }

    return <div>
        <div className={'nav-container'}>
            <div className={'nav-links' + navLinksClass}>
                <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Runs')} href={'/runs'}>
                    <FontAwesomeIcon icon={faRunning}/>
                    <span>Runs</span>
                </Nav.Link>
                <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'User Profile')} href={'/user'}>
                    <FontAwesomeIcon icon={faUserCircle}/>
                    <span>Profile</span>
                </Nav.Link>
                <Nav.Link className={'tab'} href={'http://lab-ml.com/'} target="_blank">
                    <FontAwesomeIcon icon={faBook}/>
                    <span>Documentation</span>
                </Nav.Link>
                <Nav.Link className={'tab'}
                          href={'https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/'}
                          target="_blank">
                    <FontAwesomeIcon icon={faComments}/>
                    <span>Join Our Slack</span>
                </Nav.Link>
            </div>
            <Nav.Link className={'burger'} onClick={onBurgerClick}>
                <FontAwesomeIcon icon={faBars}/>
            </Nav.Link>
            <div className={'title'}>
                <h5>{props.title}</h5>
            </div>
            {props.children}
        </div>
        {(() => {
        })()}
        <div className={'overlay' + overlayClass} onClick={onBurgerClick}/>
    </div>
}

export default HamburgerMenuBar