import React from "react";

import {Route, Switch} from "react-router-dom";

import LoginView from "../screens/login_view";
import HeaderView from "./header_view";
import RunView from "./run_view";
import ChartView from "./chart_view";
import SampleChart from "./sample_chart";
import RunsListView from "./runs_list_view";
import ReactGA from 'react-ga';

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
                            path="/sample_chart" component={SampleChart}
                        />
                        <Route
                            path="/chart" component={ChartView}
                        />
                        <Route
                            path="/run_header" component={HeaderView}
                        />
                        <Route
                            path="/run" component={RunView}
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
