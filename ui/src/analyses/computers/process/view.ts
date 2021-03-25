import {ScreenView} from "../../../screen"
import {ProcessModel} from "./types"
import CACHE, {AnalysisDataCache, ComputerStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {DataLoader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton} from "../../../components/buttons"
import processCache from "./cache"
import {ComputerHeaderCard} from '../computer_header/card'
import mix_panel from "../../../mix_panel"
import {AwesomeRefreshButton} from '../../../components/refresh_button'
import {ProcessList} from "./process_list"

class ProcessView extends ScreenView {
    elem: HTMLDivElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    statusCache: ComputerStatusCache
    series: ProcessModel[]
    analysisCache: AnalysisDataCache
    computerHeaderCard: ComputerHeaderCard
    processListContainer: HTMLDivElement
    actualWidth: number
    private loader: DataLoader
    private refresh: AwesomeRefreshButton

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.analysisCache = processCache.getAnalysis(this.uuid)

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.series = (await this.analysisCache.get(force)).series
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)

        if (this.elem) {
            this._render().then()
        }
    }

    async _render() {
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.page',
                {style: {width: `${this.actualWidth}px`}},
                $ => {
                    $('div', $ => {
                        $('div', '.nav-container', $ => {
                            new BackButton({text: 'Session', parent: this.constructor.name}).render($)
                            this.refresh.render($)
                        })
                        this.computerHeaderCard = new ComputerHeaderCard({
                            uuid: this.uuid,
                            width: this.actualWidth
                        })
                        this.computerHeaderCard.render($).then()
                        $('h2', '.header.text-center', 'Processes')
                        this.loader.render($)
                        this.processListContainer = $('div')
                    })
                })
        })

        try {
            await this.loader.load()

            this.calcPreferences()
            this.renderProcessList()
        } catch (e) {

        } finally {
            if (this.status.isRunning) {
                this.refresh.start()
            }
        }
    }

    render(): WeyaElement {
        this.elem = $('div')

        this._render().then()

        return this.elem
    }

    destroy() {
        this.refresh.stop()
    }

    async onRefresh() {
        try {
            await this.loader.load(true)

            this.calcPreferences()
            this.renderProcessList()
        } catch (e) {

        } finally {
            if (!this.status.isRunning) {
                this.refresh.stop()
            }

            this.computerHeaderCard.refresh().then()
        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
    }

    renderProcessList() {
        this.processListContainer.innerHTML = ''
        $(this.processListContainer, $ => {
            new ProcessList({items: this.series, width: this.actualWidth}).render($)
        })
    }

    calcPreferences() {
        if (this.series) {
            let res: number[] = []
            for (let i = 0; i < this.series.length; i++) {
                res.push(i)
            }
            this.plotIdx = res
        }
    }
}

export class ProcessHandler {
    constructor() {
        ROUTER.route('session/:uuid/process', [this.handleProcess])
    }

    handleProcess = (uuid: string) => {
        SCREEN.setView(new ProcessView(uuid))
    }
}
