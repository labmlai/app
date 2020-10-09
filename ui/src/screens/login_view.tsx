import React, {useEffect} from "react"
import {useAuth0} from "@auth0/auth0-react"
import {LabLoader} from "../components/loader"
import {useHistory, useLocation} from "react-router-dom"

import {UserModel} from "../models/user"

import NETWORK from '../network'
import {useErrorHandler} from "react-error-boundary";


function LoginView() {
    const history = useHistory()
    const location = useLocation()
    const handleError = useErrorHandler()

    const {from}: any = location.state || {from: {pathname: "/login"}}

    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0()

    useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                loginWithRedirect().then((res) => {
                })
            }

            if (!isLoading && isAuthenticated) {
                let data = {} as UserModel

                data.name = user.name
                data.email = user.email
                data.sub = user.sub
                data.email_verified = user.email_verified
                data.picture = user.picture

                NETWORK.sign_in(data).then((res) => {
                    if (res.data.is_successful) {
                        const uri: string = localStorage.getItem('uri')!
                        localStorage.removeItem('uri')

                        history.replace(from)

                        if (uri) {
                            history.push(uri)
                        } else {
                            history.push('/home')
                        }
                    } else {
                        handleError(Error('error in login'))
                    }
                })
            }

            if (!isLoading && error) {
                handleError(error)
            }
        },
        [isLoading]
    )

    return <div>
        <LabLoader isLoading={isLoading}/>
    </div>
}

export default LoginView