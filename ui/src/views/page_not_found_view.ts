import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"

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

class PageNotFoundView implements ScreenView {
    elem: WeyaElement

    constructor() {
        let events = []
        for (let k in this.events) {
            events.push(k)
        }

        for (let k of events) {
            let func = this.events[k]
            this.events[k] = wrapEvent(k, func)
        }
    }

    render() {
        this.elem = <HTMLElement>$('div.error-container', $ => {
            $('h2.mt-5', 'Ooops! Page not found.' + '')
            $('h1', '404')
            $('p', 'We can\'t find the page.' + '')
            $('button.danger',
                {on: {click: this.events.home}},
                $ => {
                    $('span.mt-3', 'Go Back to Home' + '')
                }
            )
        })

        return this.elem
    }

    destroy() {
    }

    private events = {
        home: () => {
            ROUTER.navigate(`/`)
        },
    }
}

export class PageNotFoundHandler {
    constructor() {
        ROUTER.route('404', [this.handlePageNotFound])
    }

    handlePageNotFound = () => {
        SCREEN.setView(new PageNotFoundView())
    }
}
