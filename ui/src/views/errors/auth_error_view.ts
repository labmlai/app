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

class AuthErrorView extends ScreenView {
    elem: WeyaElement
    private events = {
        back: () => {
            if (ROUTER.canBack()) {
                ROUTER.back()
            } else {
                ROUTER.navigate('/')
            }
        },
        login: () => {
            ROUTER.navigate(`/login`)
        },
        slack: () => {
            window.open('https://join.slack.com/t/labforml/shared_invite/zt-egj9zvq9-Dl3hhZqobexgT7aVKnD14g/')
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

        mix_panel.track('401 View')
    }

    render() {
        this.elem = <HTMLElement>$('div.error-container', $ => {
            $('h2.mt-5', 'Ooops! Authentication Failure.' + '')
            $('h1', '401')
            $('p', 'We are having trouble authenticating your request' + '')
            $('div', '.btn-container.mt-3', $ => {
                $('button.btn.btn-success',
                    {on: {click: this.events.back}},
                    $ => {
                        $('span.mt-3', 'Retry' + '')
                    }
                )
                $('button.btn.btn-warning',
                    {on: {click: this.events.login}},
                    $ => {
                        $('span.mt-3', 'Login Again' + '')
                    }
                )
                $('button.btn.btn-info',
                    {on: {click: this.events.slack}},
                    $ => {
                        $('span.mt-3', 'Reach us on Slack' + '')
                    }
                )
            })

        })

        return this.elem
    }

    destroy() {
    }
}

export class AuthErrorHandler {
    constructor() {
        ROUTER.route('401', [this.handleAuthError])
    }

    handleAuthError = () => {
        SCREEN.setView(new AuthErrorView())
    }
}
