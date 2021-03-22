import {Weya, WeyaElement, WeyaElementFunction,} from '../../../../../lib/weya/weya'
import {SeriesModel} from "../../../models/run"
import {Card, CardOptions} from "../../types"
import {AnalysisDataCache,} from "../../../cache/cache"
import hyperParamsCache from "./cache"
import {DataLoader} from "../../../components/loader"
import {ROUTER} from '../../../app'
import {toPointValues} from "../../../components/charts/utils"
import {SparkLines} from "../../../components/charts/spark_lines/chart"


export class HyperParamsCard extends Card {
    uuid: string
    width: number
    series: SeriesModel[]
    analysisCache: AnalysisDataCache
    elem: WeyaElement
    sparkLinesContainer: WeyaElement
    plotIdx: number[] = []
    private loader: DataLoader


    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.analysisCache = hyperParamsCache.getAnalysis(this.uuid)

        this.loader = new DataLoader(async (force) => {
            this.filterSeries(toPointValues((await this.analysisCache.get(force)).series))
        })
    }

    getLastUpdated(): number {
        return this.analysisCache.lastUpdated
    }

    filterSeries(series: SeriesModel[]) {
        this.series = []

        for (let s of series) {
            if (!s.name.includes('@input')) {
                this.series.push(s)
            }
        }
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3','.header', 'Dynamic Hyperparameters')
            this.loader.render($)
            this.sparkLinesContainer = $('div', '')
        })

        try {
            await this.loader.load()

            if (this.series.length > 0) {
                this.renderSparkLines()
            } else {
                this.elem.classList.add('hide')
            }
        } catch (e) {
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
                isDivergent: true
            }).render($)
        })
    }

    async refresh() {
        try {
            await this.loader.load(true)
            if (this.series.length > 0) {
                this.renderSparkLines()
                this.elem.classList.remove('hide')
            }
        } catch (e) {
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/hyper_params`)
    }
}

