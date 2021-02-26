import {Sentry, Integrations} from './sentry'

import {ROUTER} from './app'
import {RunHandler} from './views/run_view'
import {PageNotFoundHandler} from './views/page_not_found_view'
import {RunsListHandler} from './views/runs_list_view'
import {ComputersListHandler} from './views/computers_list_view'
import {LoginHandler} from './views/login_view'
import {SettingsHandler} from './views/settings_view'

import {computerAnalyses, experimentAnalyses} from "./analyses/analyses"
import {RunHeaderHandler} from "./analyses/experiments/run_header/view"
import {ComputerHandler} from './views/computer_view'
import {SENTRY_DSN} from './env'

new LoginHandler()

new RunHandler()
new ComputerHandler()
new PageNotFoundHandler()
new RunsListHandler()
new ComputersListHandler()
new SettingsHandler()

new RunHeaderHandler()

ROUTER.route('', [() => {
    ROUTER.navigate('/runs')
}])

experimentAnalyses.map((analysis, i) => {
    new analysis.viewHandler()
})

computerAnalyses.map((analysis, i) => {
    new analysis.viewHandler()
})

if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
) {
    ROUTER.start(null, false)
} else {
    document.addEventListener('DOMContentLoaded', () => {
        ROUTER.start(null, false)
    })
}

// To make sure that :active is triggered in safari
// Ref: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html
document.addEventListener("touchstart", () => {
}, true);

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
    })
}