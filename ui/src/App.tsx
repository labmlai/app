import React from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

import AppContainer from './screens/app_container'

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/" component={AppContainer}/>
            </Switch>
        </Router>
    );
}

export default App;
