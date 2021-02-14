import {ScreenView} from "../../../screen"
import {Run} from "../../../models/run"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import Filter from "../../../utils/ansi_to_html"
import {Status} from "../../../models/status"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, RefreshButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"

class StdOutView extends ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    statusCache: RunStatusCache
    runCache: RunCache
    stdOutView: HTMLDivElement
    output: HTMLPreElement

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
    }

    f = new Filter({})

    render() {
        this.elem = <HTMLElement>$('div.page', $ => {
            this.stdOutView = <HTMLDivElement>$('div', '')
        })

        this.renderStdOut().then()

        return this.elem
    }


    destroy() {
    }

    async renderStdOut() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()

        $(this.stdOutView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                if (this.status && this.status.isStatusInProgress) {
                    new RefreshButton({onButtonClick: this.onRefresh}).render($)
                }
            })
            new RunHeaderCard({uuid: this.uuid, width: 800}).render($)
            $('h2.header.text-center', 'Standard Output')
            $('div.terminal-card', $ => {
                this.output = <HTMLPreElement>$('pre', '')
            })
        })
        this.output.innerHTML = this.f.toHtml(this.run.stdout)
    }

    onRefresh() {

    }
}

export class StdOutHandler {
    constructor() {
        ROUTER.route('stdout/:uuid', [this.handleStdOut])
    }

    handleStdOut = (uuid: string) => {
        SCREEN.setView(new StdOutView(uuid))
    }
}
