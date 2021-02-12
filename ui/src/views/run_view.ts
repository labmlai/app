import {Run} from '../models/run'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import {cancelButton} from "../components/buttons"
import {AlertMessage} from "../components/alert"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import CACHE, {RunCache} from "../cache/cache"

class RunView implements ScreenView {
    run: Run
    runCache: RunCache
    elem: WeyaElement
    runView: HTMLDivElement
    uuid: string

    constructor(uuid: string) {
        this.uuid = '027f53d45ad211ebb1b4acde48001122'
        this.runCache = CACHE.getRun(this.uuid)
    }

    render() {
        this.elem = <HTMLElement>$('div.run.page', $ => {
            // this.runView = <HTMLDivElement>$('div.run_single', 'Test')
            // new cancelButton({onButtonClick: this.onRefresh}).render($)
            // new AlertMessage('This run will be deleted in 12 hours. Click here to add it to your experiments.').render($)
            // new Loader().render($)
            new RunHeaderCard({uuid: this.uuid, width: 800}).render($)
        })

        this.renderRun().then()

        return this.elem
    }

    destroy() {

    }

    onRefresh() {

    }

    private async renderRun() {
        this.runCache.get().then(

        )
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
