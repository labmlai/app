import React from "react";

import {Route, Switch} from "react-router-dom";

import LoginView from "../screens/login_view";
import RunView from "./run_view";
import PageNotFound from "./page_not_found_view";
import RunsListView from "./runs_list_view";
import ReactGA from 'react-ga';
import ConfigsCard from "../cards/configs/card"
import MetricsCard from "../cards/metrics/card"

/* TODO: Get this from configs */
ReactGA.initialize('UA-164228270-01');

function AppContainer() {
    ReactGA.pageview(window.location.pathname + window.location.search);

    return (
        <div className="page-wrapper chiller-theme toggled" id="changer">
            <main>
                <div>
                    <Switch>
                        <Route
                            path="/404" component={PageNotFound}
                        />
                        <Route
                            path="/run" component={RunView}
                        />
                        <Route
                            path="/configs" component={ConfigsCard.View}
                        />
                        <Route
                            path="/metrics" component={MetricsCard.View}
                        />
                        <Route
                            path="/runs" component={RunsListView}
                        />
                        <Route
                            path="/" component={LoginView}
                        />
                    </Switch>
                </div>
            </main>
        </div>
    );
}

export default AppContainer;
