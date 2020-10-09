import React from "react"

import {Route, Switch, Redirect} from "react-router-dom"
import {useHistory} from "react-router-dom"

import LoginView from "../screens/login_view"
import RunView from "./run_view"
import PageNotFound from "./page_not_found_view"
import TabsView from "./tabs_view"
import RunsView from "./runs_list_view"
import ReactGA from 'react-ga'
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/metrics/card"

import NETWORK from '../network'
import {useErrorHandler} from "react-error-boundary";

/* TODO: Get this from configs */
ReactGA.initialize('UA-164228270-01');

function AppContainer() {
    const uri = window.location.pathname + window.location.search

    const history = useHistory()
    const handleError = useErrorHandler()

    ReactGA.pageview(uri)

    NETWORK.axiosInstance.interceptors.response.use(function (response: any) {
        return response
    }, function (error: any) {
        if (error.response.status === 403) {
            localStorage.setItem('uri', uri)
            history.push(`/login`)
        } else if (error.response.status === 400) {
            history.push(`/404`)
        } else {
            handleError(error)
        }

        return Promise.reject(error)
    })

    return (
        <main>
            <Switch>
                <Route path="/404" component={PageNotFound}/>
                <Route path="/run" component={RunView}/>
                <Route path="/configs" component={ConfigsCard.View}/>
                <Route path="/metrics" component={MetricsCard.View}/>
                <Route path="/home" component={TabsView}/>
                <Route path="/login" component={LoginView}/>
                <Route path="/runs" component={RunsView}/>
                <Route path="/"><Redirect to="/home"/></Route>
            </Switch>
        </main>
    );
}

export default AppContainer;
