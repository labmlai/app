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
import mix_panel from "../../../mix_panel"
import {handleNetworkError} from '../../../utils/redirect'
import Timeout = NodeJS.Timeout
import {ViewHandler} from "../../types"

const AUTO_REFRESH_TIME = 2 * 60 * 1000

class LoggerView extends ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    statusCache: RunStatusCache
    runCache: RunCache
    actualWidth: number
    loggerView: WeyaElement
    outputContainer: WeyaElement
    runHeaderCard: RunHeaderCard
    autoRefresh: Timeout
    loader: Loader
    refreshButton: RefreshButton
    filter: Filter
    lastVisibilityChange: number

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.loader = new Loader(true)
        this.filter = new Filter({})

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)
    }

    render() {
        this.elem = <HTMLElement>$('div.page', $ => {
            this.loggerView = $('div', '')
        })

        this.elem.appendChild(this.loader.render($))

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
            }

            this.renderStdOut()
        }).catch(() => {
        })

        return this.elem
    }

    async loadData() {
        try {
            this.run = await this.runCache.get()
            this.status = await this.statusCache.get()
        }  catch (e) {
            handleNetworkError(e)
            return
        }
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
        if (this.runHeaderCard) {
            this.runHeaderCard.clearCounter()
        }
    }

    async onRefresh() {
        try {
            this.run = await this.runCache.get(true)
            this.status = await this.statusCache.get(true)
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.renderOutput()
        this.runHeaderCard.refresh().then()
    }

    onVisibilityChange() {
        let currentTime = Date.now()
        if (document.hidden) {
            this.lastVisibilityChange = currentTime
            clearInterval(this.autoRefresh)
        } else {
            if (this.status?.isRunning) {
                setTimeout(args => {
                    this.onRefresh().then()
                    this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
                }, Math.max(0, (this.lastVisibilityChange + AUTO_REFRESH_TIME) - currentTime))
            }
        }
    }

    renderStdOut() {
        this.loggerView.innerHTML = ''

        $(this.loggerView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                if (this.status && this.status.isRunning) {
                    this.refreshButton = new RefreshButton({
                        onButtonClick: this.onRefresh.bind(this),
                        parent: this.constructor.name
                    })
                    this.refreshButton.render($)
                }
            })
            this.runHeaderCard = new RunHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth
            })
            this.runHeaderCard.render($).then()
            $('h2.header.text-center', 'Logger')
            this.outputContainer = $('div.terminal-card')
        })

        this.renderOutput()
    }

    renderOutput() {
        this.outputContainer.innerHTML = ''
        $(this.outputContainer, $ => {
            let output = $('pre', '')
            output.innerHTML = this.filter.toHtml(this.run.logger)
        })
    }
}

export class LoggerHandler extends ViewHandler{
    constructor() {
        super()
        ROUTER.route('run/:uuid/logger', [this.handleLogger])
    }

    handleLogger = (uuid: string) => {
        SCREEN.setView(new LoggerView(uuid))
    }
}
