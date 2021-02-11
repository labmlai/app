import {ROUTER} from './app'
import {RunHandler} from './views/run_view'
import {PageNotFoundHandler} from './views/page_not_found_view'

new RunHandler()
new PageNotFoundHandler()

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
