import {ROUTER, SCREEN} from "../../../app"
import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Run} from "../../../models/run"
import {Status} from "../../../models/status"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Loader} from "../../../components/loader"
import {BackButton, RefreshButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import {Configs} from "./components"
import Timeout = NodeJS.Timeout


class ConfigsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    run: Run
    status: Status
    statusCache: RunStatusCache
    runCache: RunCache
    actualWidth: number
    autoRefresh: Timeout
    loader: Loader
    refreshButton: RefreshButton
    runHeaderCard: RunHeaderCard
    configsView: WeyaElement
    configsContainer: WeyaElement

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.loader = new Loader()
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
                this.configsView = $('div', '')
            })

        this.elem.appendChild(this.loader.render($))

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), 2 * 60 * 1000)
            }

            this.renderConfigs()
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
    }

    async onRefresh() {
        await this.loadData()

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        this.renderConfigsView()
        this.runHeaderCard.refresh().then()
    }


    renderConfigs() {
        this.configsView.innerHTML = ''

        $(this.configsView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
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
            $('h2.header.text-center', 'Configurations')
            this.configsContainer = $('div.labml-card')
        })

        this.renderConfigsView()
    }

    renderConfigsView(){
        this.configsContainer.innerHTML = ''
        $(this.configsContainer, $ => {
            new Configs({configs: this.run.configs, width: this.actualWidth, isHyperParamOnly: false}).render($)
        })
    }

}


export class ConfigsHandler {
    constructor() {
        ROUTER.route('configs/:uuid', [this.handleConfigs])
    }

    handleConfigs = (uuid: string) => {
        SCREEN.setView(new ConfigsView(uuid))
    }
}