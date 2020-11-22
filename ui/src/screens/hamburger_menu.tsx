import React, {useState} from "react"

import "./hamburger_menu.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faUserCircle, faDesktop} from "@fortawesome/free-solid-svg-icons";
import {Nav} from "react-bootstrap";
import RunsListView from "./runs_list_view";
import SettingsView from "./settings_view";


function HamburgerMenu() {
    const [navLinksClass, setNavLinksClass] = useState('')
    const [burgerClass, setBurgerClass] = useState('')
    const [currentTab, setCurrentTab] = useState('Experiments')

    function clickHandle(e: Event, tab: string) {
        if (tab === 'User Profile') {
            setCurrentTab('User Profile')
        } else if (tab === 'Experiments') {
            setCurrentTab('Experiments')
        } else {
            setCurrentTab('Computers')
        }
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
    }

    return <div>
        <div className={'nav-container'}>
            <nav>
                <div className={'title'}>
                    <h4>{currentTab}</h4>
                </div>
                <div className={'nav-links' + navLinksClass}>
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Experiments')}>
                        <FontAwesomeIcon icon={faHome}/>
                        <span>Experiments</span>
                    </Nav.Link>
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Computers')}>
                        <FontAwesomeIcon icon={faDesktop}/>
                        <span>Computers</span>
                    </Nav.Link>
                    <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'User Profile')}>
                        <FontAwesomeIcon icon={faUserCircle}/>
                        <span>User Profile</span>
                    </Nav.Link>
                </div>
                <div className={'burger' + burgerClass} onClick={onBurgerClick}>
                    <div className={'line1'}></div>
                    <div className={'line2'}></div>
                    <div className={'line3'}></div>
                </div>
            </nav>
        </div>
        {(() => {
            if (currentTab === 'User Profile') {
                return <SettingsView/>
            } else if (currentTab === 'Experiments') {
                return <RunsListView/>
            } else {
                return <div></div>
            }
        })()}
    </div>
}

export default HamburgerMenu