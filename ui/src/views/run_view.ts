import {Run} from '../models/run'
import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import {RefreshButton, BackButton} from "../components/buttons"
import {AlertMessage} from "../components/alert"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import {experimentAnalyses} from "../analyses/analyses"
import Card from "../analyses/card"
import CACHE, {RunCache, IsUserLoggedCache, RunStatusCache} from "../cache/cache"
import Timeout = NodeJS.Timeout

class RunView extends ScreenView {
    uuid: string
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    actualWidth: number
    elem: WeyaElement
    runHeaderCard: RunHeaderCard
    runView: HTMLDivElement
    autoRefresh: Timeout
    loader: Loader
    refreshButton: RefreshButton
    cards: Card[] = []
    lastUpdated: number

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()

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
        this.elem = <HTMLElement>$('div.run.page',
            {style: {width: `${this.actualWidth}px`}}, $ => {
                this.runView = <HTMLDivElement>$('div', '')
                this.loader.render($)
            })

        this.loadData().then(() => {
            if (this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), 2 * 60 * 1000)
            }

            this.renderRun().then()
        })

        return this.elem
    }

    async loadData() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()
        this.isUserLogged = await this.isUserLoggedCache.get()

        this.loader.remove()
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
    }

    async onRefresh() {
        let oldest = (new Date()).getTime()

        this.status = await this.statusCache.get()
        if (!this.status.isRunning) {
            this.refreshButton.remove()
            clearInterval(this.autoRefresh)
        }

        for (let card of this.cards) {
            card.refresh()

            let lastUpdated = card.getLastUpdated()
            if (lastUpdated < oldest) {
                oldest = lastUpdated
            }
        }

        this.lastUpdated = oldest
        this.runHeaderCard.refresh(this.lastUpdated).then()
    }

    private async renderRun() {
        this.runView.innerHTML = ''

        $(this.runView, $ => {
            if (this.isUserLogged.is_user_logged && this.run.is_claimed) {
                new AlertMessage('This run will be deleted in 12 hours. Click here to add it to your experiments.').render($)
            }
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                if (this.status.isRunning) {
                    this.refreshButton = new RefreshButton({onButtonClick: this.onRefresh.bind(this)})
                    this.refreshButton.render($)
                }
            })
            this.runHeaderCard = new RunHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth,
                lastUpdated: this.lastUpdated
            })
            this.runHeaderCard.render($)
            experimentAnalyses.map((analysis, i) => {
                let card: Card = new analysis.card({uuid: this.uuid, width: this.actualWidth})
                this.cards.push(card)
                card.render($)
            })
        })
    }
}

export class RunHandler {
    constructor() {
        ROUTER.route('run/:uuid', [this.handleRun])
    }

    handleRun = (uuid: string) => {
        SCREEN.setView(new RunView(uuid))
    }
}
