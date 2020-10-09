import React, {useEffect, useState} from "react"

import {Image, Button} from "react-bootstrap"
import {useAuth0} from "@auth0/auth0-react";
import {useErrorHandler} from "react-error-boundary";

import NETWORK from "../network";
import {LabLoader} from "../components/loader"
import useWindowDimensions from "../utils/window_dimensions";
import {User} from "../models/user";

import './settings_view.scss'


const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'

function SettingsView() {
    let [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const {logout} = useAuth0();
    const handleError = useErrorHandler()

    const {width: windowWidth} = useWindowDimensions()
    const actualWidth = Math.min(800, windowWidth)

    useEffect(() => {
        NETWORK.get_user()
            .then((res) => {
                if (res) {
                    setUser(res.data)
                    setIsLoading(false)
                }
            })
    }, [])

    function logOut() {
        NETWORK.sign_out().then((res) => {
            if (res.data.is_successful) {
                logout({returnTo: window.location.origin})
            } else {
                handleError(Error('error in logout'))
            }
        })
    }

    return <div>
        {isLoading ?
            <LabLoader isLoading={isLoading}/>
            :
            <div className={'page pl-1 pr-1'} style={{width: actualWidth}}>
                <div className={'text-center'}>
                    <Image className={'image-style'}
                           src={user.picture ? user.picture : DEFAULT_IMAGE}
                           roundedCircle/>
                    <h6 className={'mt-3'}>Your token: {user.labml_token}</h6>
                </div>
                <div className={'mt-5'}>
                    <h5>Name</h5>
                    <input type="text" placeholder="Name" defaultValue={user.name}/>
                    <h5>Email</h5>
                    <input type="text" placeholder="Email" defaultValue={user.email}/>
                </div>
                <Button className={'button-theme mt-5'} onClick={logOut}>Log out</Button>
            </div>
        }
    </div>
}


export default SettingsView;