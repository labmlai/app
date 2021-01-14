import React, {useEffect, useRef, useState} from "react"

import {Image} from "react-bootstrap"

import {LabLoader} from "../components/utils/loader"
import useWindowDimensions from "../utils/window_dimensions"
import {User} from "../models/user"
import CACHE from "../cache/cache"
import HamburgerMenuBar from "../components/utils/hamburger_menu"
import InputEditable from "../components/utils/input"

import './settings.scss'

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'
const LIGHT = 'light'
const DARK = 'dark'

function SettingsView() {
    const [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    let lightRef = useRef(null) as any
    let darkRef = useRef(null) as any

    const userCache = CACHE.getUser()

    useEffect(() => {
        async function load() {
            let currentUser = await userCache.get()
            if (currentUser) {
                setUser(currentUser)

                if (user) {
                    if (user.theme === LIGHT) {
                        if (lightRef.current) {
                            lightRef.current.defaultChecked = true
                        }
                    } else {
                        if (darkRef.current) {
                            darkRef.current.defaultChecked = true
                        }
                    }
                }

                setIsLoading(false)
            }
        }

        load().then()
    }, [lightRef, user, darkRef, userCache])


    function onThemeChange() {
        let theme = LIGHT
        if (darkRef.current.checked) {
            theme = DARK
        }
        user.theme = theme
        userCache.setUser(user).then()
        document.getElementsByTagName('body')[0].className = theme
    }

    return <div>
        <HamburgerMenuBar title={'Settings'}>
        </HamburgerMenuBar>
        {isLoading ?
            <LabLoader/>
            :
            <div className={'page pl-1 pr-1'} style={{width: actualWidth}}>
                <div className={'text-center'}>
                    <Image className={'image-style mt-2'}
                           src={user.picture ? user.picture : DEFAULT_IMAGE}
                           roundedCircle/>
                </div>
                <div className={'mt-5'}>
                    <div className={'input-list-container'}>
                        <ul>
                            <InputEditable key={1} item={'Token'} value={user.default_project}/>
                            <InputEditable key={2} item={'Name'} value={user.name}/>
                            <InputEditable key={3} item={'email'} value={user.email}/>
                            <InputEditable key={4} item={'Theme'} value={
                                <div onChange={onThemeChange}>
                                    <div className={'radio-button'}>
                                        <input type="radio" id="l-option" name="selector" ref={lightRef}/>
                                        <label htmlFor="l-option" className={'ml-2'}>Light</label>
                                    </div>
                                    <div className={'radio-button'}>
                                        <input type="radio" id="d-option" name="selector" ref={darkRef}/>
                                        <label htmlFor="d-option" className={'ml-2'}>Dark</label>
                                    </div>
                                </div>
                            }/>
                        </ul>
                    </div>
                </div>
            </div>
        }
    </div>
}


export default SettingsView