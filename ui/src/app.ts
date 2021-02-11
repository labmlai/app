import {ScreenContainer} from './screen'
import {Router} from '../../lib/weya/router'
import {AjaxHttpPort} from '../../lib/io/ajax'


export let ROUTER = new Router({
    emulateState: false,
    hashChange: false,
    pushState: true,
    root: '/',
    onerror: e => {
        console.error('Error', e)
    }
})

export let SCREEN = new ScreenContainer()

const protocol = window.location.protocol === 'http:' ? 'http' : 'https'

export let PORT = new AjaxHttpPort(
    protocol,
    window.location.hostname,
    parseInt(window.location.port),
    '/api')