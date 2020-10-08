import React from 'react';
import './App.scss';
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

import {Alert} from "react-bootstrap";
import {ErrorBoundary} from "react-error-boundary"

import AppContainer from './screens/app_container'


function ErrorFallback({error}: any) {
    return <div>
        <Alert variant={'danger'}>{error.message}</Alert>
    </div>
}

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Router>
                <Switch>
                    <Route path="/" component={AppContainer}/>
                </Switch>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
