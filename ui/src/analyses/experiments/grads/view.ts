import {Weya, Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import CACHE, {AnalysisDataCache, AnalysisPreferenceCache, RunStatusCache} from "../../../cache/cache"
import {SeriesModel} from "../../../models/run"
import {AnalysisPreferenceModel} from "../../../models/preferences"
import {BackButton, RefreshButton, SaveButton, ToggleButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import gradientsCache from "./cache"
import {LineChart} from "../../../components/charts/lines/chart"
import {getChartType, toPointValues} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {ScreenView} from "../../../screen"
import {ROUTER, SCREEN} from "../../../app"
import mix_panel from "../../../mix_panel"
import {ViewHandler} from "../../types"
import {Loader} from "../../../components/loader";
import Timeout = NodeJS.Timeout;


const AUTO_REFRESH_TIME = 2 * 60 * 1000

export class ErrorMessage {
    elem: HTMLDivElement

    constructor() {
        this.elem = null
    }

    render(parent: HTMLDivElement) {
        Weya(parent, $ => {
            this.elem = $('div', '.error.text-center.warning', $ => {
                $('span', '.fas.fa-exclamation-triangle', '')
                $('h4', '.text-uppercase', 'Network error')
            })
        })
    }

    remove() {
        if (this.elem == null) {
            return
        }
        this.elem.remove()
        this.elem = null
    }
}


async function waitForFrame() {
    return new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
            resolve()
        })
    })
}

class DataLoader {
    private _load: () => Promise<void>;
    private loaded: boolean;
    private loader: Loader;
    private elem: HTMLDivElement;
    private errorMessage: ErrorMessage;

    constructor(load: () => Promise<void>) {
        this._load = load
        this.loaded = false
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    render(parent: HTMLElement) {
        Weya(parent, $ => {
            this.elem = $('div', '.data-loader')
        })
    }

    async load() {
        this.errorMessage.remove()
        if (!this.loaded) {
            this.elem.appendChild(this.loader.render(Weya))
            await waitForFrame()
        }

        try {
            await this._load()
            this.loaded = true
        } catch (e) {
            this.errorMessage.render(this.elem)
            throw e
        } finally {
            this.loader.remove()
        }
    }
}

class AwesomeRefreshButton {
    private _refresh: () => Promise<void>;
    private refreshTimeout: Timeout
    private lastVisibilityChange: number;
    private isActive: boolean

    constructor(refresh: () => Promise<void>) {
        this._refresh = refresh
        this.refreshTimeout = null
        this.isActive = false
    }

    start() {
        if (this.isActive) {
            throw "oops"
        }
        this.isActive = true
        this.refreshTimeout = setTimeout(this.refresh, AUTO_REFRESH_TIME)
    }

    private refresh = async () => {
        await this._refresh()
        this.refreshTimeout = setTimeout(this.refresh, AUTO_REFRESH_TIME)
    }

    _stop() {
        if (this.refreshTimeout != null) {
            clearTimeout(this.refreshTimeout)
            this.refreshTimeout = null
        }
    }
    stop() {
        this.isActive = false
    }

    changeVisibility(isVisible: boolean) {
        let currentTime = Date.now()
        if (!isVisible) {
            this.lastVisibilityChange = currentTime
            this._stop()
            return
        }

        if (!this.isActive) {
            return
        }

        this.refreshTimeout = setTimeout(this.refresh,
            Math.max(0, (this.lastVisibilityChange + AUTO_REFRESH_TIME) - currentTime))
    }
}


class GradientsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    currentChart: number
    statusCache: RunStatusCache
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: AnalysisDataCache
    preferenceCache: AnalysisPreferenceCache
    refreshButton: RefreshButton
    runHeaderCard: RunHeaderCard
    sparkLines: SparkLines
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    saveButtonContainer: WeyaElement
    saveButton: SaveButton
    isUpdateDisable: boolean
    actualWidth: number
    metricsView: HTMLDivElement
    lastVisibilityChange: number
    private loader: DataLoader;
    private refresh: AwesomeRefreshButton;

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.currentChart = 0
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = gradientsCache.getAnalysis(this.uuid)
        this.preferenceCache = gradientsCache.getPreferences(this.uuid)

        this.isUpdateDisable = true
        this.saveButton = new SaveButton({onButtonClick: this.updatePreferences, parent: this.constructor.name})

        this.loader = new DataLoader(async () => {
            this.series = toPointValues((await this.analysisCache.get()).series)
            this.status = await this.statusCache.get()
            this.preferenceData = await this.preferenceCache.get()
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

        this._render()
    }

    async _render() {
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.page',
                {style: {width: `${this.actualWidth}px`}},
                $ => {
                    this.metricsView = $('div', '')
                })
        })

        this.loader.render(this.metricsView)

        try {
            await this.loader.load()
            if (this.status.isRunning) {
                this.refresh.start()
            }

            this.loadPreferences()
            this.renderGradients()
        } catch (e) {

        }
    }

    render(): WeyaElement {
        this.elem = $('div', '.page')

        this._render()

        return this.elem
    }

    destroy() {
        this.refresh.stop()
        if (this.runHeaderCard) {
            this.runHeaderCard.clearCounter()
        }
    }

    async onRefresh() {
        try {
            await this.loader.load()
            if (!this.status.isRunning) {
                this.refresh.stop()
                this.refreshButton.remove()
            }

            this.renderSparkLines()
            this.renderLineChart()
            this.runHeaderCard.refresh().then()
        } catch (e) {

        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
    }

    renderGradients() {
        this.metricsView.innerHTML = ''

        $(this.metricsView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                this.saveButtonContainer = $('div')
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
            new ToggleButton({
                onButtonClick: this.onChangeScale,
                text: 'Log',
                isToggled: this.currentChart > 0,
                parent: this.constructor.name
            }).render($)
            $('h2.header.text-center', 'Gradients - L2 Norm')
            $('div.detail-card', $ => {
                this.lineChartContainer = $('div.fixed-chart')
                this.sparkLinesContainer = $('div')
            })
        })

        this.renderSparkLines()
        this.renderLineChart()
        this.renderSaveButton()
    }

    renderSaveButton() {
        this.saveButton.disabled = this.isUpdateDisable
        this.saveButtonContainer.innerHTML = ''
        $(this.saveButtonContainer, $ => {
            this.saveButton.render($)
        })
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        $(this.lineChartContainer, $ => {
            new LineChart({
                series: this.series,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                chartType: getChartType(this.currentChart),
                onCursorMove: [this.sparkLines.changeCursorValues],
                isCursorMoveOpt: true
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            this.sparkLines = new SparkLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
                onSelect: this.toggleChart,
                isEditable: false
            })
            this.sparkLines.render($)
        })
    }

    toggleChart = (idx: number) => {
        this.isUpdateDisable = false

        if (this.plotIdx[idx] >= 0) {
            this.plotIdx[idx] = -1
        } else {
            this.plotIdx[idx] = Math.max(...this.plotIdx) + 1
        }

        if (this.plotIdx.length > 1) {
            this.plotIdx = new Array<number>(...this.plotIdx)
        }

        this.renderSparkLines()
        this.renderLineChart()
        this.renderSaveButton()
    }

    loadPreferences() {
        this.currentChart = this.preferenceData.chart_type

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences && analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        } else if (this.series) {
            let res: number[] = []
            for (let i = 0; i < this.series.length; i++) {
                res.push(i)
            }
            this.plotIdx = res
        }
    }

    onChangeScale = () => {
        this.isUpdateDisable = false

        if (this.currentChart === 1) {
            this.currentChart = 0
        } else {
            this.currentChart = this.currentChart + 1
        }

        this.renderLineChart()
        this.renderSaveButton()
    }

    updatePreferences = () => {
        this.preferenceData.series_preferences = this.plotIdx
        this.preferenceData.chart_type = this.currentChart
        this.preferenceCache.setPreference(this.preferenceData).then()

        this.isUpdateDisable = true
        this.renderSaveButton()
    }
}

export class GradientsHandler extends ViewHandler {
    constructor() {
        super()
        ROUTER.route('run/:uuid/grads', [this.handleGradients])
    }

    handleGradients = (uuid: string) => {
        SCREEN.setView(new GradientsView(uuid))
    }
}
