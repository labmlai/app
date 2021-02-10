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

class RunView implements ScreenView {
    elem: WeyaElement
    runView: HTMLDivElement
    uuid: string

    constructor(uuid: string) {
        this.uuid = uuid
    }

    render() {
        this.elem = <HTMLElement>$('div.container', $ => {
            this.runView = <HTMLDivElement>$('div.run_single', 'Test')
        })

        return this.elem
    }
}

export class RunHandler {
    constructor() {
        ROUTER.route('run/:uuid', [this.handleRun])
    }

    handleRun = (uuid: string) => {
        SCREEN.setView(new RunView(uuid))
    }
}
