import {ROUTER} from './app'
import {RunHandler} from './views/run_view'
import {PageNotFoundHandler} from './views/page_not_found_view'
import {RunsListHandler} from './views/runs_list_view'
import {ComputersListHandler} from './views/computers_list_view'

import {RunHeaderHandler} from './analyses/experiments/run_header/view'
import {StdOutHandler} from './analyses/experiments/stdout/view'
import {StdErrorHandler} from './analyses/experiments/stderror/view'
import {LoggerHandler} from './analyses/experiments/logger/view'
import {MetricsHandler} from './analyses/experiments/metrics/view'

new RunHandler()
new PageNotFoundHandler()
new RunsListHandler()
new ComputersListHandler()

new RunHeaderHandler()
new StdOutHandler()
new StdErrorHandler()
new LoggerHandler()
new MetricsHandler()

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
