import React, {useEffect, useState} from "react"

import {Image} from "react-bootstrap"

import {LabLoader} from "../components/utils/loader"
import useWindowDimensions from "../utils/window_dimensions"
import {User} from "../models/user"
import CACHE from "../cache/cache"
import HamburgerMenuBar from "../components/utils/hamburger_menu"
import InputEditable from "../components/utils/input"

const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'

function SettingsView() {
    const [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

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
                        </ul>
                    </div>
                </div>
            </div>
        }
    </div>
}


export default SettingsView