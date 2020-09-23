import React, {useEffect} from "react";

import {Route, Switch} from "react-router-dom";

import LoginView from "../screens/login_view";
import RunView from "./run_view";
import PageNotFound from "./page_not_found_view";
import RunsListView from "./runs_list_view";
import ReactGA from 'react-ga';
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/metrics/card"

import NETWORK from '../network'

/* TODO: Get this from configs */
ReactGA.initialize('UA-164228270-01');


function Auth() {
    useEffect(() => {
        NETWORK.auth().then((res) => {
            window.location.href = res.data.uri;
        })
    }, [])

    return <div>
    </div>
}

function AppContainer() {
    ReactGA.pageview(window.location.pathname + window.location.search);

    return (
        <main>
            <Switch>
                <Route path="/404" component={PageNotFound}/>
                <Route path="/run" component={RunView}/>
                <Route path="/configs" component={ConfigsCard.View}/>
                <Route path="/metrics" component={MetricsCard.View}/>
                <Route path="/runs" component={RunsListView}/>
                <Route path="/login" component={LoginView}/>
                <Route  path="/" component={Auth}  />
            </Switch>
        </main>
    );
}

export default AppContainer;
