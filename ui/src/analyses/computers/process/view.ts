import {ScreenView} from "../../../screen"
import {SeriesModel} from "../../../models/run"
import CACHE, {AnalysisDataCache, ComputerStatusCache} from "../../../cache/cache"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import {DataLoader} from "../../../components/loader"
import {ROUTER, SCREEN} from "../../../app"
import {BackButton} from "../../../components/buttons"
import processCache from "./cache"
import {toPointValues} from "../../../components/charts/utils"
import {ComputerHeaderCard} from '../computer_header/card'
import {SparkTimeLines} from '../../../components/charts/spark_time_lines/chart'
import mix_panel from "../../../mix_panel"
import {AwesomeRefreshButton} from '../../../components/refresh_button'

class ProcessView extends ScreenView {
    elem: HTMLDivElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    statusCache: ComputerStatusCache
    series: SeriesModel[]
    analysisCache: AnalysisDataCache
    computerHeaderCard: ComputerHeaderCard
    sparkTimeLines: SparkTimeLines
    sparkLinesContainer: HTMLDivElement
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
            this.series = toPointValues((await this.analysisCache.get(force)).series)
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
                        $('div', '.detail-card', $ => {
                            this.sparkLinesContainer = $('div')
                        })
                    })
                })
        })

        try {
            await this.loader.load()

            this.calcPreferences()

            this.renderSparkLines()
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
            this.renderSparkLines()
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

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            this.sparkTimeLines = new SparkTimeLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
            })
            this.sparkTimeLines.render($)
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
