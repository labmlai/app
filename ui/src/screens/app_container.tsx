import React, {useEffect, useState} from "react"

import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom"

import RunView from "./run_view"
import PageNotFound from "./page_not_found_view"
import TabsView from "./tabs_view"
import RunsView from "./runs_list_view"
import ReactGA from 'react-ga'
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/tracks/metrics/card"
import ParamsCard from "../cards/tracks/params/card"
import GradsCard from "../cards/tracks/grads/card"
import ModulesCard from "../cards/tracks/modules/card"
import TimesCard from "../cards/tracks/times/card"
import {useErrorHandler} from "react-error-boundary";
import NETWORK from "../network";
import {useAuth0} from "@auth0/auth0-react";
import {LabLoader} from "../components/loader";
import {UserModel} from "../models/user";

/* TODO: Get this from configs */
ReactGA.initialize('UA-164228270-01');

function AppContainer() {
    const location = useLocation()
    const handleError = useErrorHandler()
    const history = useHistory()

    const {isAuthenticated, user, isLoading, loginWithRedirect, error} = useAuth0()
    let [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
            if (error) {
                handleError(error)
            } else if (isLoading) {
            } else if (!isAuthenticated) {
                let uri = location.pathname + location.search
                loginWithRedirect({appState: {returnTo: uri}}).then()
            } else if (isAuthenticated && !loggedIn) {
                let data = {} as UserModel

                data.name = user.name
                data.email = user.email
                data.sub = user.sub
                data.email_verified = user.email_verified
                data.picture = user.picture

                NETWORK.sign_in(data).then((res) => {
                    if (res.data.is_successful) {
                        setLoggedIn(true)
                        // const uri: string = localStorage.getItem('uri')!
                        // localStorage.removeItem('uri')
                    } else {
                        handleError(Error('error in login'))
                    }
                })
            }
        },
        [loggedIn, isLoading, user, isAuthenticated, handleError, location, error, loginWithRedirect]
    )

    useEffect(() => {
        ReactGA.pageview(location.pathname + location.search)
    }, [location])

    NETWORK.handleError = function (error: any) {
        if (error === undefined || error.response === undefined) {
            console.log('undefined error or response')
        } else if (error.response.status === 403) {
            setLoggedIn(false)
        } else if (error.response.status === 400) {
            history.push(`/404`)
        } else {
            handleError(error)
        }

        return error
    }

    if (!loggedIn) {
        return <div>
            <LabLoader/>
        </div>
    }
    return (
        <main>
            <Switch>
                <Route path="/404" component={PageNotFound}/>
                <Route path="/run" component={RunView}/>
                <Route path="/configs" component={ConfigsCard.View}/>
                <Route path="/metrics" component={MetricsCard.View}/>
                <Route path="/grads" component={GradsCard.View}/>
                <Route path="/params" component={ParamsCard.View}/>
                <Route path="/modules" component={ModulesCard.View}/>
                <Route path="/times" component={TimesCard.View}/>
                <Route path="/home" component={TabsView}/>
                <Route path="/runs" component={RunsView}/>
                <Route path="/"><Redirect to="/home"/></Route>
                <Route path="/"><Redirect to="/login"/></Route>
            </Switch>
        </main>
    );
}

export default AppContainer;
