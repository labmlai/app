import React from "react";

import {Route, Switch} from "react-router-dom";

import MainView from "../screens/main_view";
import RunView from "./run_view";
import ChartView from "./chart_view";
import SampleChart from "./sample_chart";

function AppContainer() {
    return (
        <div className="page-wrapper chiller-theme toggled" id="changer">
            <main >
                <div>
                    <Switch>
                         <Route
                             path="/sample_chart" component={SampleChart}
                         />
                         <Route
                             path="/chart" component={ChartView}
                         />
                         <Route
                             path="/run" component={RunView}
                         />
                         <Route
                            path="/" component={MainView}
                        />
                    </Switch>
                </div>
            </main>
        </div>
    );
}

export default AppContainer;
