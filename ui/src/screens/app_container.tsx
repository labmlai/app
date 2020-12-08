import React, {useEffect, useState} from "react"

import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import {Image} from "react-bootstrap"
import {useAuth0} from "@auth0/auth0-react"

import RunView from "./run_view"
import ComputerView from "./computer_view"
import PageNotFound from "./page_not_found_view"
import RunsView from "./runs_list_view"
import ConfigsCard from "../analyses/configs/card"
import {experiment_analyses, computer_analyses} from "../analyses/all_analyses"
import NETWORK from "../network"
import {LabLoader} from "../components/utils/loader"
import {UserModel} from "../models/user"
import logo from "../assets/lab_logo.png"
import {captureException} from "@sentry/react"
import CACHE from "../cache/cache"
import {IsUserLogged} from "../models/user"
import SettingsView from "./settings_view"


function AppContainer() {
    const location = useLocation()
    const history = useHistory()

    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0()
    const [loggedIn, setLoggedIn] = useState(false)

    const isUserLoggedCache = CACHE.getIsUserLogged()

    useEffect(() => {
            function isRunPath(): boolean {
                const runPath = '/run'

                if (location && location.state !== '/login') {
                    return location.state === runPath || location.pathname === runPath
                }

                return false
            }

            let isUserLogged: IsUserLogged

            async function load(): Promise<boolean> {
                isUserLogged = await isUserLoggedCache.get()

                return isUserLogged.is_user_logged
            }

            load().then((is_user_logged) => {
                let currentState = is_user_logged || isRunPath()
                setLoggedIn(currentState)

                if (error) {
                    captureException(error)
                } else if (isLoading) {
                } else if (!isAuthenticated && !currentState) {
                    let uri = location.pathname + location.search
                    if (location.state) {
                        uri = location.state.toString()
                    }
                    loginWithRedirect({appState: {returnTo: uri}}).then()
                } else if (isAuthenticated && !currentState) {
                    let data = {} as UserModel

                    mixpanel.identify(user.sub)
                    mixpanel.people.set({
                        $first_name: user.first_name,
                        $last_name: user.last_name,
                        $email: user.email
                    })

                    data.name = user.name
                    data.email = user.email
                    data.sub = user.sub
                    data.email_verified = user.email_verified
                    data.picture = user.picture

                    NETWORK.signIn(data).then((res) => {
                        if (res.data.is_successful) {
                            setLoggedIn(true)
                            isUserLoggedCache.UserLogged = true
                            mixpanel.track('Successful login')
                        } else {
                            captureException(Error('error in login'))
                            mixpanel.track('Login failed')
                        }
                    })
                }
            })

        },
        [loggedIn, isLoading, user, isAuthenticated, location, error, loginWithRedirect, isUserLoggedCache]
    )

    NETWORK.handleError = function (error: any) {
        if (error === undefined || error.response === undefined) {
            captureException(Error('undefined error or response'))
        } else if (error.response.status === 403) {
            setLoggedIn(false)
            mixpanel.track('unauthorized')
        } else if (error.response.status === 400) {
            mixpanel.track('404', {path: location.pathname + location.search});
            history.push(`/404`)
        } else {
            captureException(error)
        }

        return error
    }

    if (!loggedIn) {
        return <div>
            <div className={'text-center mt-5'}>
                <Image className={'image-style'}
                       src={logo}/>
                <h1 className={'mt-3 '}>LabML</h1>
            </div>
            <LabLoader/>
        </div>
    }
    return (
        <main>
            <Switch>
                <Route path="/404" component={PageNotFound}/>
                <Route path="/run" component={RunView}/>
                <Route path="/computer" component={ComputerView}/>
                <Route path="/configs" component={ConfigsCard.View}/>
                <Route path="/user" component={SettingsView}/>
                <Route path="/runs" component={RunsView}/>
                {experiment_analyses.map((analysis, i) => {
                    return <Route key={i} path={`/${analysis.route}`} component={analysis.view}/>
                })}
                {computer_analyses.map((analysis, i) => {
                    return <Route key={i} path={`/${analysis.route}`} component={analysis.view}/>
                })}
                <Route path="/"><Redirect to="/runs"/></Route>
                <Route path="/"><Redirect to="/login"/></Route>
            </Switch>
        </main>
    );
}

export default AppContainer
