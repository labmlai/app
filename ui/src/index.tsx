import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'

import * as Sentry from '@sentry/react'
import {Integrations} from '@sentry/tracing'
import {Auth0Provider} from "@auth0/auth0-react"

import App from './App'

if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
    });
}

const authODomain: string = process.env.REACT_APP_AUTHO_DOMAIN !
const authOClientID: string = process.env.REACT_APP_AUTHO_CLIENT_ID !

ReactDOM.render(
    <React.StrictMode>
        <Auth0Provider
            domain={authODomain}
            clientId={authOClientID}
            redirectUri={window.location.origin + '/login'}
        >
            <App/>
        </Auth0Provider>,
    </React.StrictMode>,
    document.getElementById('root')
);
