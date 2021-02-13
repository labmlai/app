import {ScreenView} from "../../../screen"
import {Run} from "../../../models/run"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import Filter from "../../../utils/ansi_to_html"
import {Status} from "../../../models/status"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, RefreshButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"

class LoggerView implements ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    statusCache: RunStatusCache
    runCache: RunCache
    loggerView: HTMLDivElement
    output: HTMLDivElement

    constructor(uuid: string) {
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
    }

    filter = new Filter({})

    render() {
        this.elem = <HTMLElement>$('div.page', $ => {
            this.loggerView = <HTMLDivElement>$('div', '')
        })

        this.renderStdOut().then()

        return this.elem
    }


    destroy() {
    }

    async renderStdOut() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()

        $(this.loggerView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                if (this.status && this.status.isStatusInProgress) {
                    new RefreshButton({onButtonClick: this.onRefresh}).render($)
                }
            })
            new RunHeaderCard({uuid: this.uuid, width: 800}).render($)
            $('h2.header.text-center', 'Logger')
            $('div.terminal-card', $ => {
                this.output = <HTMLDivElement>$('pre', '')
            })
        })
        this.output.innerHTML = this.filter.toHtml(this.run.logger)
    }

    onRefresh() {

    }
}

export class LoggerHandler {
    constructor() {
        ROUTER.route('logger/:uuid', [this.handleLogger])
    }

    handleLogger = (uuid: string) => {
        SCREEN.setView(new LoggerView(uuid))
    }
}