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

class OtherErrorView extends ScreenView {
    elem: WeyaElement
    private events = {
        back: () => {
            if (ROUTER.canBack()) {
                ROUTER.back()
            } else {
                ROUTER.navigate('/')
            }
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

        mix_panel.track('500 View')
    }

    get requiresAuth(): boolean {
        return false
    }

    render() {
        this.elem = <HTMLElement>$('div.error-container', $ => {
            $('h2.mt-5', 'Ooops! Something went wrong' + '')
            $('h1', '500')
            $('p', 'Seems like we are having issues right now' + '')
            $('div', '.btn-container.mt-3', $ => {
                $('button.btn.btn-success',
                    {on: {click: this.events.back}},
                    $ => {
                        $('span.mt-3', 'Retry' + '')
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

export class OtherErrorHandler {
    constructor() {
        ROUTER.route('500', [this.handleOtherError])
    }

    handleOtherError = () => {
        SCREEN.setView(new OtherErrorView())
    }
}
