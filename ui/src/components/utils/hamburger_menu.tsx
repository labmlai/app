import React, {ReactElement, useState} from "react"

import {useHistory} from "react-router-dom"

import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHome, faUserCircle, faBook, faComments} from "@fortawesome/free-solid-svg-icons"
import "./hamburger_menu.scss"

interface HamburgerMenuBarProps {
    title: string
    children: ReactElement | never[]
}

function HamburgerMenuBar(props: HamburgerMenuBarProps) {
    const [navLinksClass, setNavLinksClass] = useState('')
    const [burgerClass, setBurgerClass] = useState('')
    const [overlayClass, setOverlayClass] = useState('')

    const history = useHistory()

    function clickHandle(e: Event, tab: string) {
        // setCurrentTab(tab)
        e.preventDefault()
        if (tab === 'Experiments') {
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

        // Burger Animation
        if (burgerClass) {
            setBurgerClass('')
        } else {
            setBurgerClass(' toggle')
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
            <nav>
                <div className={'nav-links' + navLinksClass}>
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Experiments')} href={'/runs'}>
                        <FontAwesomeIcon icon={faHome}/>
                        <span>Experiments</span>
                    </Nav.Link>
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'User Profile')} href={'/user'}>
                        <FontAwesomeIcon icon={faUserCircle}/>
                        <span>User Profile</span>
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
                <div className={'burger' + burgerClass} onClick={onBurgerClick}>
                    <div className={'line1'}></div>
                    <div className={'line2'}></div>
                    <div className={'line3'}></div>
                </div>
                <div className={'title ml-4 mt-1'}>
                    <h4>{props.title}</h4>
                </div>
                {props.children}
            </nav>
        </div>
        {(() => {
        })()}
        <div className={'overlay' + overlayClass}/>
    </div>
}

export default HamburgerMenuBar