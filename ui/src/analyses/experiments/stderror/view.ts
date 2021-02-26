import {ScreenView} from "../../../screen"
import {Run} from "../../../models/run"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import Filter from "../../../utils/ansi_to_html"
import {Status} from "../../../models/status"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton, RefreshButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import {Loader} from "../../../components/loader"
import Timeout = NodeJS.Timeout


class StdErrorView extends ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    statusCache: RunStatusCache
    runCache: RunCache
    actualWidth: number
    loggerView: WeyaElement
    outputContainer: WeyaElement
    autoRefresh: Timeout
    loader: Loader
    refreshButton: RefreshButton
    runHeaderCard: RunHeaderCard
    filter: Filter

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.loader = new Loader(true)
        this.filter = new Filter({})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)
    }

    render() {
        this.elem = <HTMLElement>$('div.page',
            {style: {width: `${this.actualWidth}px`}}, $ => {
                this.loggerView = $('div', '')
            })

        this.elem.appendChild(this.loader.render($))

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), 2 * 60 * 1000)
            }

            this.renderStdOut()
        })

        return this.elem
    }

    async loadData() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
        this.runHeaderCard.clearCounter()
    }

    async onRefresh() {
        this.run = await this.runCache.get(true)
        this.status = await this.statusCache.get(true)

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.runHeaderCard.render($).then()
        this.renderOutput()
    }

    renderStdOut() {
        this.loggerView.innerHTML = ''

        $(this.loggerView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run'}).render($)
                if (this.status && this.status.isRunning) {
                    this.refreshButton = new RefreshButton({onButtonClick: this.onRefresh.bind(this)})
                    this.refreshButton.render($)
                }
            })
            this.runHeaderCard = new RunHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth
            })
            this.runHeaderCard.render($).then()
            $('h2.header.text-center', 'Standard Error')
            $('div.terminal-card', $ => {
                this.outputContainer = $('div', '')
            })
        })

        this.renderOutput()
    }

    renderOutput() {
        this.outputContainer.innerHTML = ''
        $(this.outputContainer, $ => {
            let output = $('pre', '')
            output.innerHTML = this.filter.toHtml(this.run.stderr)
        })
    }
}

export class StdErrorHandler {
    constructor() {
        ROUTER.route('stderr/:uuid', [this.handleStdError])
    }

    handleStdError = (uuid: string) => {
        SCREEN.setView(new StdErrorView(uuid))
    }
}
