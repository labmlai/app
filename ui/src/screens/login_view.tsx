import React, {useEffect} from "react"
import {useAuth0} from "@auth0/auth0-react"
import {LabLoader} from "../components/loader"
import {useHistory, useLocation} from "react-router-dom"

import {UserModel} from "../models/user"

import NETWORK from '../network'
import {useErrorHandler} from "react-error-boundary";
import {APP_STATE} from "../app_state";


function LoginView() {
    const history = useHistory()
    const location = useLocation()
    const handleError = useErrorHandler()

    const {from}: any = location.state || {from: {pathname: "/login"}}

    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0()

    useEffect(() => {
        console.log(isLoading, isAuthenticated)
            if (APP_STATE.isLoggedIn()) {
                history.replace('/home')
            }
            else if (!isLoading && !isAuthenticated) {
                loginWithRedirect().then()
            }
            else if (!isLoading && isAuthenticated) {
                let data = {} as UserModel

                data.name = user.name
                data.email = user.email
                data.sub = user.sub
                data.email_verified = user.email_verified
                data.picture = user.picture

                NETWORK.sign_in(data).then((res) => {
                    if (res.data.is_successful) {
                        APP_STATE.setLoggedIn(true)
                        const uri: string = localStorage.getItem('uri')!
                        localStorage.removeItem('uri')

                        if (uri) {
                            history.replace(uri)
                        } else {
                            history.replace('/home')
                        }
                    } else {
                        handleError(Error('error in login'))
                    }
                })
            }
            else if (!isLoading && error) {
                handleError(error)
            }
        },
        [isLoading, isAuthenticated]
    )

    return <div>
        <LabLoader isLoading={isLoading}/>
    </div>
}

export default LoginView