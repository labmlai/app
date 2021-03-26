import {Run} from '../models/run'
import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {DataLoader} from "../components/loader"
import {BackButton, DeleteButton} from "../components/buttons"
import {AlertMessage} from "../components/alert"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import {experimentAnalyses} from "../analyses/analyses"
import {Card} from "../analyses/types"
import CACHE, {IsUserLoggedCache, RunCache, RunStatusCache} from "../cache/cache"
import mix_panel from "../mix_panel"
import {handleNetworkError, handleNetworkErrorInplace} from '../utils/redirect'
import {AwesomeRefreshButton} from '../components/refresh_button'
import {setTitle} from '../utils/document'

class RunView extends ScreenView {
    uuid: string
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    actualWidth: number
    elem: HTMLDivElement
    runHeaderCard: RunHeaderCard
    cards: Card[] = []
    lastUpdated: number
    private cardContainer: HTMLDivElement
    private deleteButton: DeleteButton
    private alertMessage: AlertMessage
    private loader: DataLoader
    private refresh: AwesomeRefreshButton

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()

        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete.bind(this), parent: this.constructor.name})
        this.alertMessage = new AlertMessage({
            message: 'This run will be deleted in 12 hours. Click here to add it to your runs.',
            onClickMessage: this.onMessageClick.bind(this)
        })

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.run = await this.runCache.get(force)
            this.isUserLogged = await this.isUserLoggedCache.get(force)
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        mix_panel.track('Run View', {uuid: this.uuid})
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
        setTitle({section: 'Run'})
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.run.page',
                {style: {width: `${this.actualWidth}px`}}, $ => {
                    $('div', $ => {
                        this.alertMessage.render($)
                        this.alertMessage.hideMessage(true)
                        $('div.nav-container', $ => {
                            new BackButton({text: 'Runs', parent: this.constructor.name}).render($)
                            this.deleteButton.render($)
                            this.deleteButton.hide(true)
                            this.refresh.render($)
                        })
                        this.runHeaderCard = new RunHeaderCard({
                            uuid: this.uuid,
                            width: this.actualWidth,
                            lastUpdated: this.lastUpdated,
                            clickable: true
                        })
                        this.loader.render($)
                        this.runHeaderCard.render($)
                        this.cardContainer = $('div')
                    })
                })
        })

        try {
            await this.loader.load()

            setTitle({section: 'Run', item: this.run.name})
            this.renderCards()
        } catch (e) {
            handleNetworkErrorInplace(e)
        } finally {
            if (this.status && this.status.isRunning) {
                this.refresh.attachHandler(this.runHeaderCard.renderLastRecorded.bind(this.runHeaderCard))
                this.refresh.start()
            }
        }
    }

    private renderCards() {
        $(this.cardContainer, $ => {
            experimentAnalyses.map((analysis, i) => {
                let card: Card = new analysis.card({uuid: this.uuid, width: this.actualWidth})
                this.cards.push(card)
                card.render($)
            })
        })

        this.alertMessage.hideMessage(!(!this.isUserLogged.is_user_logged && !this.run.is_claimed))
        this.deleteButton.hide(!(this.isUserLogged.is_user_logged && this.run.is_claimed))
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
        let oldest = (new Date()).getTime()
        try {
            await this.loader.load(true)
        } catch (e) {

        } finally {
            if (this.status && !this.status.isRunning) {
                this.refresh.stop()
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

    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
    }

    onMessageClick() {
        mix_panel.track('Unclaimed Warning Clicked', {uuid: this.uuid, analysis: this.constructor.name})

        ROUTER.navigate(`/login#return_url=${window.location.pathname}`)
    }

    onDelete = async () => {
        if (confirm("Are you sure?")) {
            try {
                await CACHE.getRunsList().deleteRuns(new Set<string>([this.uuid]))
            } catch (e) {
                handleNetworkError(e)
                return
            }
            ROUTER.navigate('/runs')
        }
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
