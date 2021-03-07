import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import Card from "../../card"
import {CardOptions} from "../../types"
import {SeriesCache, SeriesPreferenceCache} from "../../../cache/cache"
import hyperParamsCache from "./cache"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'
import {AnalysisPreferenceModel} from "../../../models/preferences"
import {toPointValues} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"


export class HyperParamsCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    preferenceData: AnalysisPreferenceModel
    analysisCache: SeriesCache
    elem: WeyaElement
    lineChartContainer: WeyaElement
    sparkLinesContainer: WeyaElement
    preferenceCache: SeriesPreferenceCache
    plotIdx: number[] = []
    loader: Loader


    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = hyperParamsCache.getAnalysis(this.uuid)
        this.preferenceCache = hyperParamsCache.getPreferences(this.uuid)
        this.loader = new Loader()
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Hyperparameters')
        })

        this.elem.appendChild(this.loader.render($))
        try {
            this.series = toPointValues((await this.analysisCache.get()).series)
            this.preferenceData = await this.preferenceCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        let analysisPreferences = this.preferenceData.series_preferences
        if (analysisPreferences.length > 0) {
            this.plotIdx = [...analysisPreferences]
        }

        Weya(this.elem, $ => {
            this.lineChartContainer = $('div', '')
            this.sparkLinesContainer = $('div', '')
        })

        if (this.series.length > 0) {
            this.renderSparkLines()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderSparkLines() {
        this.sparkLinesContainer.innerHTML = ''
        Weya(this.sparkLinesContainer, $ => {
            new SparkLines({
                series: this.series,
                plotIdx: this.plotIdx,
                width: this.width,
                isEditable: false,
                isDivergent : true
            }).render($)
        })
    }

    async refresh() {
        try {
            this.series = toPointValues((await this.analysisCache.get(true)).series)
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.series.length > 0) {
            this.renderSparkLines()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/hyper_params`)
    }
}
