import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import CACHE, {AnalysisDataCache, RunStatusCache} from "../../../cache/cache"
import {SeriesModel} from "../../../models/run"
import {BackButton, SaveButton} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import hyperParamsCache from "./cache"
import {toPointValues} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {ScreenView} from "../../../screen"
import {ROUTER, SCREEN} from "../../../app"
import mix_panel from "../../../mix_panel"
import {ViewHandler} from "../../types"
import {DataLoader} from "../../../components/loader"
import {AwesomeRefreshButton} from '../../../components/refresh_button'
import {CustomLineChart} from "../../../components/charts/custom_lines/chart"

class HyperParamsView extends ScreenView {
    elem: HTMLDivElement
    uuid: string
    status: Status
    plotIdx: number[] = []
    primeSeries: SeriesModel[]
    minorSeries: SeriesModel[]
    analysisCache: AnalysisDataCache
    statusCache: RunStatusCache
    runHeaderCard: RunHeaderCard
    sparkLines: SparkLines
    lineChartContainer: HTMLDivElement
    sparkLinesContainer: HTMLDivElement
    saveButtonContainer: HTMLDivElement
    saveButton: SaveButton
    isUpdateDisable: boolean
    actualWidth: number
    private loader: DataLoader
    private refresh: AwesomeRefreshButton
    isEditMode: boolean

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = hyperParamsCache.getAnalysis(this.uuid)

        this.saveButton = new SaveButton({onButtonClick: this.onSave.bind(this), parent: this.constructor.name})

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.filterSeries(toPointValues((await this.analysisCache.get(true)).series))

            if (this.status && this.status.isRunning) {
                this.isEditMode = true
            }
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
                            new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                            this.saveButtonContainer = $('div')
                            this.refresh.render($)
                        })
                        this.runHeaderCard = new RunHeaderCard({
                            uuid: this.uuid,
                            width: this.actualWidth
                        })
                        this.runHeaderCard.render($).then()
                        $('h2', '.header.text-center', 'Dynamic Hyperparameters')
                        this.loader.render($)
                        $('div', '.detail-card', $ => {
                            this.sparkLinesContainer = $('div')
                            this.lineChartContainer = $('div')
                        })
                    })
                })
        })

        try {
            await this.loader.load()

            this.calcPreferences()

            this.renderSparkLines()
            this.renderLineChart()
            this.renderSaveButton()
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
        if (this.runHeaderCard) {
            this.runHeaderCard.clearCounter()
        }
    }

    async onRefresh() {
        try {
            await this.loader.load(true)
            this.calcPreferences()
        } catch (e) {

        } finally {
            if (!this.status.isRunning) {
                this.refresh.stop()
                this.isEditMode = false
            }
            this.runHeaderCard.refresh().then()
            this.renderSparkLines()
            this.renderLineChart()
        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
    }

    renderSaveButton() {
        this.saveButtonContainer.innerHTML = ''
        $(this.saveButtonContainer, $ => {
            if (this.status.isRunning) {
                this.saveButton.render($)
            }
        })
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        $(this.lineChartContainer, $ => {
            new CustomLineChart({
                primeSeries: this.primeSeries,
                minotSeries: this.minorSeries,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                onCursorMove: [this.sparkLines.changeCursorValues],
                isCursorMoveOpt: true,
            }).render($)
        })
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        $(this.sparkLinesContainer, $ => {
            this.sparkLines = new SparkLines({
                series: this.primeSeries,
                plotIdx: this.plotIdx,
                width: this.actualWidth,
                isEditable: this.isEditMode,
                onSelect: this.toggleChart,
                isDivergent: true
            })
            this.sparkLines.render($)
        })
    }

    toggleChart = (idx: number) => {
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
    }

    private calcPreferences() {
        this.plotIdx = []
        for (let i = 0; i < this.primeSeries.length; i++) {
            this.plotIdx.push(i)
        }
    }

    filterSeries(series: SeriesModel[]) {
        let primeSeries: SeriesModel[] = []
        let minorSeries: SeriesModel[] = []

        for (let s of series) {
            if (s.name.includes('@input')) {
                minorSeries.push(s)
            } else {
                primeSeries.push(s)
            }
        }

        this.minorSeries = minorSeries
        this.primeSeries = primeSeries
    }

    onSave() {
        let data = this.sparkLines.getSparkLinesValues()
        this.analysisCache.setAnalysis(data).then()
    }

}

export class HyperParamsHandler extends ViewHandler {
    constructor() {
        super()
        ROUTER.route('run/:uuid/hyper_params', [this.handleHyperParams])
    }

    handleHyperParams = (uuid: string) => {
        SCREEN.setView(new HyperParamsView(uuid))
    }
}