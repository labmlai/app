import {ScreenView} from "../../../screen"
import {ProcessDetailsModel} from "./types"
import CACHE, {ComputerCache, ComputerStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {DataLoader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton} from "../../../components/buttons"
import {processDetailsCache} from "./cache"
import {ComputerHeaderCard} from '../computer_header/card'
import mix_panel from "../../../mix_panel"
import {AwesomeRefreshButton} from '../../../components/refresh_button'
import {handleNetworkErrorInplace} from '../../../utils/redirect'
import {Computer} from '../../../models/computer'
import {setTitle} from '../../../utils/document'
import {DetailsDataCache} from "./cache_helper"

class ProcessDetailView extends ScreenView {
    elem: HTMLDivElement
    uuid: string
    processId: string
    status: Status
    plotIdx: number[] = []
    statusCache: ComputerStatusCache
    series: ProcessDetailsModel
    analysisCache: DetailsDataCache
    computerHeaderCard: ComputerHeaderCard
    actualWidth: number
    private loader: DataLoader
    private refresh: AwesomeRefreshButton
    private computerCache: ComputerCache
    private computer: Computer

    constructor(uuid: string, processId: string) {
        super()

        this.uuid = uuid
        this.processId = processId
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.analysisCache = processDetailsCache.getAnalysis(this.uuid, this.processId)

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.computer = await this.computerCache.get()
            this.series = (await this.analysisCache.get(force))

            console.log(this.series)
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
        setTitle({section: 'Processes Details'})
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
                        $('h2', '.header.text-center', 'Processes Details')
                        this.loader.render($)
                    })
                })
        })

        try {
            await this.loader.load()

            setTitle({section: 'Processes Details', item: this.computer.name})
        } catch (e) {
            handleNetworkErrorInplace(e)
        } finally {
            if (this.status && this.status.isRunning) {
                this.refresh.attachHandler(this.computerHeaderCard.renderLastRecorded.bind(this.computerHeaderCard))
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
        } catch (e) {

        } finally {
            if (this.status && !this.status.isRunning) {
                this.refresh.stop()
            }

            this.computerHeaderCard.refresh().then()
        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
    }
}

export class ProcessDetailsHandler {
    constructor() {
        ROUTER.route('session/:uuid/process/details/:processId', [this.handleProcessDetails])
    }

    handleProcessDetails = (uuid: string, processId: string) => {
        SCREEN.setView(new ProcessDetailView(uuid, processId))
    }
}
