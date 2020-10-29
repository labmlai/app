import React, {useEffect, useState} from "react"

import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom"

import LoginView from "../screens/login_view"
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
import {APP_STATE} from "../app_state";
import NETWORK from "../network";

/* TODO: Get this from configs */
ReactGA.initialize('UA-164228270-01');

const loginNotRequiredPaths = ['/login', '/404']

function shouldLoggedInCheck(uri: string) {
    for (let p of loginNotRequiredPaths) {
        if (uri.startsWith(p)) {
            return false
        }
    }

    return true
}


function AppContainer() {
    const location = useLocation()
    const handleError = useErrorHandler()
    const history = useHistory()

    let [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        setLoggedIn(APP_STATE.isLoggedIn())
        APP_STATE.onLoginChanged(state => {
                setLoggedIn(state)
            }
        )
        if (!loggedIn && location.pathname != '/login') {
            localStorage.setItem('uri', location.pathname + location.search)
        }
    }, [loggedIn, location])

    useEffect(() => {
        ReactGA.pageview(location.pathname + location.search)
    }, [location])

    NETWORK.handleError = function (error: any) {
        if (error === undefined || error.response === undefined) {
            console.log('undefined error or response')
        } else if (error.response.status === 403) {
            APP_STATE.setLoggedIn(false)
            history.replace(`/login`)
        } else if (error.response.status === 400) {
            history.push(`/404`)
        } else {
            handleError(error)
        }

        return error
    }

    return (
        <main>
            <Switch>
                <Route path="/404" component={PageNotFound}/>
                <Route path="/login" component={LoginView}/>
                {loggedIn && <Route path="/run" component={RunView}/>}
                {loggedIn && <Route path="/configs" component={ConfigsCard.View}/>}
                {loggedIn && <Route path="/metrics" component={MetricsCard.View}/>}
                {loggedIn && <Route path="/grads" component={GradsCard.View}/>}
                {loggedIn && <Route path="/params" component={ParamsCard.View}/>}
                {loggedIn && <Route path="/modules" component={ModulesCard.View}/>}
                {loggedIn && <Route path="/times" component={TimesCard.View}/>}
                {loggedIn && <Route path="/home" component={TabsView}/>}
                {loggedIn && <Route path="/runs" component={RunsView}/>}
                {loggedIn && <Route path="/"><Redirect to="/home"/></Route>}
                {!loggedIn && <Route path="/"><Redirect to="/login"/></Route>}
            </Switch>
        </main>
    );
}

export default AppContainer;
