import React, {useEffect, useState} from "react"

import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom"

import mixpanel from "mixpanel-browser"
import {Image} from "react-bootstrap"
import {useErrorHandler} from "react-error-boundary"
import {useAuth0} from "@auth0/auth0-react"

import RunView from "./run_view"
import PageNotFound from "./page_not_found_view"
import HamburgerMenu from "./hamburger_menu"
import RunsView from "./runs_list_view"
import ConfigsCard from "../analyses/configs/card"
import analyses from "../analyses/all_analyses"
import NETWORK from "../network"
import {LabLoader} from "../components/loader"
import {UserModel} from "../models/user"
import logo from "../assets/lab_logo.png"


function AppContainer() {
    const location = useLocation()
    const handleError = useErrorHandler()
    const history = useHistory()

    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0()
    let [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
            function isRunPath(): boolean {
                const runPath = '/run'
                if (location) {
                    return location.state === runPath || location.pathname === runPath
                }

                return false
            }

            if (error) {
                handleError(error)
            } else if (isRunPath()) {
                setLoggedIn(true)
            } else if (isLoading) {
            } else if (!isAuthenticated) {
                let uri = location.pathname + location.search
                loginWithRedirect({appState: {returnTo: uri}}).then()
            } else if (isAuthenticated && !loggedIn) {
                let data = {} as UserModel

                mixpanel.identify(user.sub);
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
                        mixpanel.track('Successful login');
                    } else {
                        handleError(Error('error in login'))
                        mixpanel.track('Login failed');
                    }
                })
            }
        },
        [loggedIn, isLoading, user, isAuthenticated, handleError, location, error, loginWithRedirect]
    )

    NETWORK.handleError = function (error: any) {
        if (error === undefined || error.response === undefined) {
            console.log('undefined error or response')
        } else if (error.response.status === 403) {
            setLoggedIn(false)
            mixpanel.track('unauthorized')
        } else if (error.response.status === 400) {
            mixpanel.track('404', {path: location.pathname + location.search});
            history.push(`/404`)
        } else {
            handleError(error)
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
                <Route path="/configs" component={ConfigsCard.View}/>
                <Route path="/home" component={HamburgerMenu}/>
                <Route path="/runs" component={RunsView}/>
                {analyses.map((analysis, i) => {
                    return <Route key={i} path={`/${analysis.route}`} component={analysis.view}/>
                })}
                <Route path="/"><Redirect to="/home"/></Route>
                <Route path="/"><Redirect to="/login"/></Route>
            </Switch>
        </main>
    );
}

export default AppContainer;
