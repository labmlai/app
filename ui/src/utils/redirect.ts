import {NetworkError} from '../network';
import {ROUTER} from '../app';
import {Sentry} from '../sentry';

export function handleNetworkError(error: any) {
    if(error instanceof NetworkError) {
        if (error.statusCode === 404 || error.statusCode === 400) {
            ROUTER.navigate('/404')
        } else if (error.statusCode === 401 || error.statusCode === 403) {
            ROUTER.navigate('/401')
        } else {
            ROUTER.navigate('/500')
        }
    } else {
        ROUTER.navigate('/network_error')
    }
    Sentry.setExtra(error)
    Sentry.captureException(error)
}
