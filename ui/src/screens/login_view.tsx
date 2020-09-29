import React, {useEffect} from "react"
import {useAuth0} from "@auth0/auth0-react"
import {LabLoader} from "../components/loader"
import {useHistory} from "react-router-dom"

import {SignInData} from "../models/login"

import NETWORK from '../network'
import {Alert} from "react-bootstrap";


function LoginView() {
    const history = useHistory()
    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0();

    useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                loginWithRedirect().then((res) => {
                })
            }

            if (!isLoading && isAuthenticated) {
                let data = {} as SignInData

                data.name = user.name
                data.email = user.email
                data.sub = user.sub
                data.email_verified = user.email_verified

                NETWORK.sign_in(data).then((res) => {
                    if (res.data.is_successful) {
                        const uri: string = localStorage.getItem('uri')!
                        localStorage.removeItem('uri')

                        if (uri) {
                            history.push(uri)
                        } else {
                            history.push('/runs')
                        }
                    }
                })
            }
        },
        [isLoading]
    )

    return <div>
        {
            error ?
                <Alert variant={'danger'}>{error}</Alert>
                :
                <LabLoader isLoading={isLoading}/>
        }
    </div>
}

export default LoginView