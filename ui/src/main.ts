import {ROUTER} from './app'
import {RunHandler} from './run_view'

new RunHandler()

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
