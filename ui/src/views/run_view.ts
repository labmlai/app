import {Run} from '../models/run'
import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import {BackButton, RefreshButton} from "../components/buttons"
import {AlertMessage} from "../components/alert"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import {experimentAnalyses} from "../analyses/analyses"
import Card from "../analyses/card"
import CACHE, {IsUserLoggedCache, RunCache, RunStatusCache} from "../cache/cache"
import mix_panel from "../mix_panel"
import Timeout = NodeJS.Timeout;


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

        this.loader = new Loader(true)

        mix_panel.track('Run View', {uuid: this.uuid})
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
        }).catch(() => {
        })

        return this.elem
    }

    async loadData() {
        try {
            this.run = await this.runCache.get()
            this.status = await this.statusCache.get()
            this.isUserLogged = await this.isUserLoggedCache.get()
        } catch (e) {
            ROUTER.navigate('/404')
            throw e
        }

        this.loader.remove()
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

    onMessageClick() {
        mix_panel.track('Unclaimed Warning Clicked', {uuid: this.uuid, analysis: this.constructor.name})

        ROUTER.navigate(`/login#return_url=${window.location.pathname}`)
    }

    private async renderRun() {
        this.runView.innerHTML = ''

        $(this.runView, $ => {
            if (!this.isUserLogged.is_user_logged && !this.run.is_claimed) {
                new AlertMessage({
                    message: 'This run will be deleted in 12 hours. Click here to add it to your experiments.',
                    onClickMessage: this.onMessageClick.bind(this)
                }).render($)
            }
            $('div.nav-container', $ => {
                new BackButton({text: 'Runs', parent: this.constructor.name}).render($)
                if (this.status.isRunning) {
                    this.refreshButton = new RefreshButton({
                        onButtonClick: this.onRefresh.bind(this),
                        parent: this.constructor.name
                    })
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
