import {ROUTER, SCREEN} from '../../app'
import {Weya as $, WeyaElement} from '../../../../lib/weya/weya'
import {ScreenView} from "../../screen"
import mix_panel from "../../mix_panel"

function wrapEvent(eventName: string, func: Function) {
    function wrapper() {
        let e: Event = arguments[arguments.length - 1]
        if (eventName[eventName.length - 1] !== '_') {
            e.preventDefault()
            e.stopPropagation()
        }

        func.apply(null, arguments)
    }

    return wrapper
}

class NetworkErrorView extends ScreenView {
    elem: WeyaElement
    private events = {
        retry: () => {
            if (ROUTER.canBack()) {
                ROUTER.back()
            }
        },
    }

    constructor() {
        super()
        let events = []
        for (let k in this.events) {
            events.push(k)
        }

        for (let k of events) {
            let func = this.events[k]
            this.events[k] = wrapEvent(k, func)
        }

        mix_panel.track('Network Error View')
    }

    get requiresAuth(): boolean {
        return false
    }

    render() {
        this.elem = <HTMLElement>$('div.error-container', $ => {
            $('h2.mt-5', 'Ooops!' + '')
            $('p', 'There\'s a problem with the connection between you and us' + '')
            $('button.btn.btn-danger.mt-3',
                {on: {click: this.events.retry}},
                $ => {
                    $('span.mt-3', 'Retry' + '')
                }
            )
        })

        return this.elem
    }

    destroy() {
    }
}

export class NetworkErrorHandler {
    constructor() {
        ROUTER.route('network_error', [this.handleNetworkError])
    }

    handleNetworkError = () => {
        SCREEN.setView(new NetworkErrorView())
    }
}
