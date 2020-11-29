import React, {useState} from "react"

import {Nav} from "react-bootstrap"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faHome, faUserCircle, faBook, faComments} from "@fortawesome/free-solid-svg-icons"

import RunsListView from "./runs_list_view"
import SettingsView from "./settings_view"

import "./hamburger_menu.scss"


function HamburgerMenu() {
    const [navLinksClass, setNavLinksClass] = useState('')
    const [burgerClass, setBurgerClass] = useState('')
    const [overlayClass, setOverlayClass] = useState('')
    const [currentTab, setCurrentTab] = useState('Experiments')

    function clickHandle(e: Event, tab: string) {
        setCurrentTab(tab)
        onBurgerClick()
    }

    function onBurgerClick() {
        // Toggle Nav
        if (navLinksClass) {
            setNavLinksClass('')
        } else {
            setNavLinksClass(' nav-active')
        }

        // Animate Links
        const navLinks = document.querySelectorAll<HTMLElement>('.nav-links .tab')
        navLinks.forEach((link: HTMLElement, index: number) => {
            if (link.style.animation) {
                link.style.animation = ''
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`
            }
        })

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
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Experiments')}>
                        <FontAwesomeIcon icon={faHome}/>
                        <span>Experiments</span>
                    </Nav.Link>
                    {/*<Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Computers')}>*/}
                    {/*    <FontAwesomeIcon icon={faDesktop}/>*/}
                    {/*    <span>Computers</span>*/}
                    {/*</Nav.Link>*/}
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'User Profile')}>
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
                    <h4>{currentTab}</h4>
                </div>
            </nav>
        </div>
        {(() => {
            if (currentTab === 'User Profile') {
                return <SettingsView/>
            } else if (currentTab === 'Experiments') {
                return <RunsListView/>
            } else {
                return <div className={'text-center'}>
                    <h1 className={'mt-5'}>Under Construction</h1>
                </div>
            }
        })()}
        <div className={'overlay' + overlayClass}/>
    </div>
}

export default HamburgerMenu