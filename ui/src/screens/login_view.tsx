import React from 'react'
import {GoogleLogin} from 'react-google-login'
import {Image} from "react-bootstrap"

import NETWORK from '../network'
import labLogoSrc from "../assets/lab_logo.png"
import gLogoSrc from "../assets/g_normal.png"

import './login_view.scss'


function LoginView() {
    const clientID: any = process.env.REACT_APP_GOOGLE_CLIENT_ID

    function responseGoogle(response: any) {
        NETWORK.google_sign_in(response.tokenObj.id_token).then((res) => {
            window.location.href = res.data.uri;
        })
    }

    return <div className={"login-view"}>
        <div className={"login-view-centre"}>
            <Image className={"pt-5"} src={labLogoSrc} rounded/>
            <h1 className={"mt-3"}>LabML</h1>
            <div className={"mt-3"}>
                <GoogleLogin
                    clientId={clientID}
                    render={renderProps => (
                        <a onClick={renderProps.onClick} className="customBtn" type='button'>
                            <Image className={"icon"} src={gLogoSrc}/>
                            <span className="buttonText ">Sign in with Google</span>
                        </a>
                    )}
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                />
            </div>
        </div>
    </div>
}

export default LoginView