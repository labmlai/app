import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import {BackButton, DeleteButton, RefreshButton} from "../components/buttons"
import Card from "../analyses/card"
import CACHE, {ComputerCache, ComputerStatusCache, IsUserLoggedCache} from "../cache/cache"
import {Computer} from '../models/computer'
import {ComputerHeaderCard} from '../analyses/computers/computer_header/card'
import {computerAnalyses} from '../analyses/analyses'
import {AlertMessage} from "../components/alert"
import mix_panel from "../mix_panel"
import {handleNetworkError} from '../utils/redirect'
import Timeout = NodeJS.Timeout
import {DropShadow} from "../components/charts/chart_gradients"


const AUTO_REFRESH_TIME = 2 * 60 * 1000

class ComputerView extends ScreenView {
    uuid: string
    computer: Computer
    computerCache: ComputerCache
    status: Status
    statusCache: ComputerStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    actualWidth: number
    elem: WeyaElement
    computerHeaderCard: ComputerHeaderCard
    runView: HTMLDivElement
    autoRefresh: Timeout
    loader: Loader
    refreshButton: RefreshButton
    cards: Card[] = []
    lastUpdated: number
    lastVisibilityChange: number

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()

        this.loader = new Loader(true)

        mix_panel.track('Computer View', {uuid: this.uuid})
    }

    get requiresAuth(): boolean {
        return false
    }

    onResize(width: number) {
        super.onResize(width)

        this.actualWidth = Math.min(800, width)
    }

    render() {
        this.elem = <HTMLElement>$('div', '.run.page',
            {style: {width: `${this.actualWidth}px`}}, $ => {
                new DropShadow().render($)
                this.runView = $('div', '')
                this.loader.render($)
            })

        this.loadData().then(() => {
            if (this.status.isRunning) {
                this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
            }

            this.renderRun().then()
        }).catch(() => {
        })

        return this.elem
    }

    async loadData() {
        try {
            this.computer = await this.computerCache.get()
            this.status = await this.statusCache.get()
            this.isUserLogged = await this.isUserLoggedCache.get()
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }

        this.loader.remove()
    }

    destroy() {
        if (this.autoRefresh !== undefined) {
            clearInterval(this.autoRefresh)
        }
        if (this.computerHeaderCard) {
            this.computerHeaderCard.clearCounter()
        }
    }

    async onRefresh() {
        let oldest = (new Date()).getTime()

        try {
            this.status = await this.statusCache.get()
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }
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
        this.computerHeaderCard.refresh(this.lastUpdated).then()
    }

    onVisibilityChange() {
        let currentTime = Date.now()
        if (document.hidden) {
            this.lastVisibilityChange = currentTime
            clearInterval(this.autoRefresh)
        } else {
            if (this.status.isRunning) {
                setTimeout(args => {
                    this.onRefresh().then()
                    this.autoRefresh = setInterval(this.onRefresh.bind(this), AUTO_REFRESH_TIME)
                }, Math.max(0, (this.lastVisibilityChange + AUTO_REFRESH_TIME) - currentTime))
            }
        }
    }

    onMessageClick() {
        mix_panel.track('Unclaimed Warning Clicked', {uuid: this.uuid, analysis: this.constructor.name})

        ROUTER.navigate(`/login#return_url=${window.location.pathname}`)
    }

    onDelete = async () => {
        if (confirm("Are you sure?")) {
            try {
                await CACHE.getComputersList().deleteSessions(new Set<string>([this.uuid]))
            } catch (e) {
                handleNetworkError(e)
                return
            }
            ROUTER.navigate('/computers')
        }
    }

    private async renderRun() {
        this.runView.innerHTML = ''

        $(this.runView, $ => {
            if (!this.isUserLogged.is_user_logged && !this.computer.is_claimed) {
                new AlertMessage({
                    message: 'This computer will be deleted in 12 hours. Click here to add it to your experiments.',
                    onClickMessage: this.onMessageClick.bind(this)
                }).render($)
            }
            $('div', '.nav-container', $ => {
                new BackButton({text: 'Computers', parent: this.constructor.name}).render($)
                if (this.isUserLogged.is_user_logged && this.computer.is_claimed) {
                    new DeleteButton({onButtonClick: this.onDelete.bind(this), parent: this.constructor.name}).render($)
                }
                if (this.status.isRunning) {
                    this.refreshButton = new RefreshButton({
                        onButtonClick: this.onRefresh.bind(this),
                        parent: this.constructor.name
                    })
                    this.refreshButton.render($)
                }
            })
            this.computerHeaderCard = new ComputerHeaderCard({
                uuid: this.uuid,
                width: this.actualWidth,
                lastUpdated: this.lastUpdated
            })
            this.computerHeaderCard.render($)
            computerAnalyses.map((analysis, i) => {
                let card: Card = new analysis.card({uuid: this.uuid, width: this.actualWidth})
                this.cards.push(card)
                card.render($)
            })
        })
    }
}

export class ComputerHandler {
    constructor() {
        ROUTER.route('session/:uuid', [this.handleSession])
    }

    handleSession = (uuid: string) => {
        SCREEN.setView(new ComputerView(uuid))
    }
}
