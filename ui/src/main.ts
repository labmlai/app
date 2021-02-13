import {ROUTER} from './app'
import {RunHandler} from './views/run_view'
import {PageNotFoundHandler} from './views/page_not_found_view'

import {RunHeaderHandler} from './analyses/experiments/run_header/view'
import {StdOutHandler} from './analyses/experiments/stdout/view'
import {StdErrorHandler} from './analyses/experiments/stderror/view'
import {LoggerHandler} from './analyses/experiments/logger/view'

new RunHandler()
new PageNotFoundHandler()

new RunHeaderHandler()
new StdOutHandler()
new StdErrorHandler()
new LoggerHandler()

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
