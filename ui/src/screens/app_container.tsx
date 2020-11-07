import React, {useEffect, useState} from "react"

import {Redirect, Route, Switch, useHistory, useLocation} from "react-router-dom"

import RunView from "./run_view"
import PageNotFound from "./page_not_found_view"
import TabsView from "./tabs_view"
import RunsView from "./runs_list_view"
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/analyses/metrics/card"
import ParamsCard from "../cards/analyses/params/card"
import GradsCard from "../cards/analyses/grads/card"
import ModulesCard from "../cards/analyses/modules/card"
import TimesCard from "../cards/analyses/times/card"
import {useErrorHandler} from "react-error-boundary";
import NETWORK from "../network";
import {useAuth0} from "@auth0/auth0-react";
import {LabLoader} from "../components/loader";
import {UserModel} from "../models/user";
import mixpanel from "mixpanel-browser";

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

                NETWORK.sign_in(data).then((res) => {
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
            mixpanel.track('unauthorized');
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
