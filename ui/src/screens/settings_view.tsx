import React, {useEffect, useState} from "react"
import {Image, Form, Col, Button} from "react-bootstrap"

import './settings_view.scss'
import NETWORK from "../network";
import {LabLoader} from "../components/loader"
import useWindowDimensions from "../utils/window_dimensions";
import {User} from "../models/user";
import {useAuth0} from "@auth0/auth0-react";


const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/azouaoui-med/pro-sidebar-template/gh-pages/src/img/user.jpg'

function SettingsView() {
    let [user, setUser] = useState(null as unknown as User)
    const [isLoading, setIsLoading] = useState(true)

    const {logout} = useAuth0();

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
            .catch((err) => {
                console.log(err)
            })
    }, [])

    function logOut() {
        NETWORK.sign_out().then((res) => {
            if (res.data.is_successful) {
                logout({returnTo: window.location.origin})
            }
        })
    }

    return <div>
        {isLoading ?
            <LabLoader isLoading={isLoading}/>
            :
            <div className={'page pl-2 pr-2'} style={{width: actualWidth}}>
                <div className={'text-center'}>
                    <Image className={'image-style'}
                           src={user.picture ? user.picture : DEFAULT_IMAGE}
                           roundedCircle/>
                    <h6 className={'mt-3'}> Your token : {user.labml_token}</h6>
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