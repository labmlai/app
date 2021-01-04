import React, {ReactElement, useEffect, useState} from "react"

import {useHistory} from "react-router-dom"

import {Image, Nav} from "react-bootstrap"
import {useAuth0} from "@auth0/auth0-react"
import {captureException} from "@sentry/react"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
    faRunning,
    faUserCircle,
    faBook,
    faComments,
    faBars,
    faDesktop,
    faPowerOff
} from "@fortawesome/free-solid-svg-icons"

import {LabLoader} from "./loader"
import {User} from "../../models/user"
import CACHE from "../../cache/cache"
import NETWORK from "../../network"

import "./hamburger_menu.scss"

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'

interface HamburgerMenuBarProps {
    title: string
    children: ReactElement | never[]
}

function HamburgerMenuBar(props: HamburgerMenuBarProps) {
    const [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const [navLinksClass, setNavLinksClass] = useState('')
    const [overlayClass, setOverlayClass] = useState('')

    const {logout} = useAuth0()
    const history = useHistory()

    useEffect(() => {
        const userCache = CACHE.getUser()

        async function load() {
            let currentUser = await userCache.get()
            if (currentUser) {
                setUser(currentUser)
                setIsLoading(false)
            }
        }

        load().then()
    }, [])

    function logOut() {
        NETWORK.signOut().then((res) => {
            if (res.is_successful) {
                logout({returnTo: window.location.origin})
            } else {
                captureException(Error('error in logout'))
            }
        })
    }

    function clickHandle(e: Event, tab: string) {
        // setCurrentTab(tab)
        e.preventDefault()
        if (tab === 'Runs') {
            history.push('/runs')
        } else if ('Computers') {
            history.push('/computers')
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
                {isLoading ?
                    <LabLoader/>
                    :
                    <div className={'text-center'}>
                        <Image className={'mt-2'}
                               src={user.picture ? user.picture : DEFAULT_IMAGE}
                               roundedCircle/>
                        <div className={'text-secondary mt-2'}>
                            <h6>Token:</h6>
                            <h6 className={'mt-2'}>{user && user.default_project}</h6>
                        </div>
                        <div className={'mb-5 mt-3'}>
                            <h5>{user.name}</h5>
                            <h5>{user.email}</h5>
                        </div>
                    </div>}
                <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Runs')} href={'/runs'}>
                    <FontAwesomeIcon icon={faRunning}/>
                    <span>Runs</span>
                </Nav.Link>
                <Nav.Link className={'tab'} onClick={(e: any) => clickHandle(e, 'Computers')} href={'/computers'}>
                    <FontAwesomeIcon icon={faDesktop}/>
                    <span>Computers</span>
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
                    <span>Join our Slack</span>
                </Nav.Link>
                <Nav.Link className={'tab mt-5'} onClick={logOut}>
                    <FontAwesomeIcon icon={faPowerOff}/>
                    <span>Log out</span>
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