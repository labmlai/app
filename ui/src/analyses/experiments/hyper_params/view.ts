import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {Status} from "../../../models/status"
import CACHE, {RunStatusCache, AnalysisDataCache} from "../../../cache/cache"
import {Run, SeriesModel} from "../../../models/run"
import {Loader} from "../../../components/loader"
import {
    BackButton,
    RefreshButton,
    SaveButton
} from "../../../components/buttons"
import {RunHeaderCard} from "../run_header/card"
import hyperParamsCache from "./cache"
import {LineChart} from "../../../components/charts/lines/chart"
import {toPointValues} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"
import {ScreenView} from "../../../screen"
import {ROUTER, SCREEN} from "../../../app"
import mix_panel from "../../../mix_panel"
import Timeout = NodeJS.Timeout
import {handleNetworkError} from '../../../utils/redirect'
import {ViewHandler} from "../../types"


const AUTO_REFRESH_TIME = 2 * 60 * 1000

class HyperParamsView extends ScreenView {
    elem: WeyaElement
    uuid: string
    status: Status
    run: Run
    series: SeriesModel[]
    statusCache: RunStatusCache
    analysisCache: AnalysisDataCache
    plotIdx: number[] = []
    loader: Loader
    runHeaderCard: RunHeaderCard
    sparkLines: SparkLines
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    SaveButtonContainer: WeyaElement
    refreshButton: RefreshButton
    saveButton: SaveButton
    isEditMode: boolean
    actualWidth: number
    autoRefresh: Timeout
    hyperParamsView: HTMLDivElement
    lastVisibilityChange: number

    constructor(uuid: string) {
        super()

        this.uuid = uuid
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.analysisCache = hyperParamsCache.getAnalysis(this.uuid)

        this.loader = new Loader(true)
        this.saveButton = new SaveButton({onButtonClick: this.onSave, parent: this.constructor.name})

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)
    }

    render(): WeyaElement {
        this.elem = <HTMLElement>$('div.page',
            {style: {width: `${this.actualWidth}px`}},
            $ => {
                this.hyperParamsView = <HTMLDivElement>$('div', '')
                this.loader.render($)
            })

        this.loadData().then(() => {
            this.loader.remove()

            if (this.status && this.status.isRunning) {
                this.isEditMode = true
                this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
            }

            this.renderGradients()
        }).catch(() => {
        })

        return this.elem
    }

    async loadData() {
        try {
            this.series = toPointValues((await this.analysisCache.get()).series)
            this.status = await this.statusCache.get()

            for (let i = 0; i < this.series.length; i++) {
                this.plotIdx.push(i)
            }
        } catch (e) {
            //TODO: redirect after multiple refresh failures
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
            this.series = toPointValues((await this.analysisCache.get(true)).series)
            this.status = await this.statusCache.get(true)
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }

        if (!this.status.isRunning) {
            this.refreshButton.remove()
            this.isEditMode = false
            clearInterval(this.autoRefresh)
        }

        this.renderSparkLines()
        this.renderLineChart()
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

    renderGradients() {
        this.hyperParamsView.innerHTML = ''

        $(this.hyperParamsView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                this.SaveButtonContainer = $('div')
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
            $('h2.header.text-center', 'Hyperparameters')
            $('div.detail-card', $ => {
                this.sparkLinesContainer = $('div')
                this.lineChartContainer = $('div')
            })
        })

        this.renderSparkLines()
        this.renderLineChart()
        this.renderSaveButtons()
    }

    renderSaveButtons() {
        this.SaveButtonContainer.innerHTML = ''
        $(this.SaveButtonContainer, $ => {
            if (this.status.isRunning) {
                this.saveButton.render($)
            }
        })
    }

    onSave = () => {
        let data = this.sparkLines.getSparkLinesValues()
        this.analysisCache.setAnalysis(data).then()

        this.renderSaveButtons()
    }

    renderLineChart() {
        this.lineChartContainer.innerHTML = ''
        $(this.lineChartContainer, $ => {
            new LineChart({
                series: this.series,
                width: this.actualWidth,
                plotIdx: this.plotIdx,
                chartType: 'linear',
                onCursorMove: [this.sparkLines.changeCursorValues],
                isCursorMoveOpt: true,
                isDivergent: true
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
                isEditable: this.isEditMode,
                onSelect: this.toggleChart,
                isMouseMoveOpt: !this.isEditMode,
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
