import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {DataLoader} from "../components/loader"
import {AddButton, BackButton, CustomButton} from "../components/buttons"
import {Card} from "../analyses/types"
import CACHE, {ComputerCache, ComputersListCache, ComputerStatusCache, IsUserLoggedCache} from "../cache/cache"
import {Computer} from '../models/computer'
import {ComputerHeaderCard} from '../analyses/computers/computer_header/card'
import {computerAnalyses} from '../analyses/analyses'
import {UserMessages} from "../components/alert"
import mix_panel from "../mix_panel"
import {handleNetworkErrorInplace} from '../utils/redirect'
import {AwesomeRefreshButton} from '../components/refresh_button'
import {setTitle} from '../utils/document'

class ComputerView extends ScreenView {
    uuid: string
    computer: Computer
    computerCache: ComputerCache
    status: Status
    statusCache: ComputerStatusCache
    computerListCache: ComputersListCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    actualWidth: number
    elem: HTMLDivElement
    computerHeaderCard: ComputerHeaderCard
    cards: Card[] = []
    lastUpdated: number
    ButtonsContainer: HTMLSpanElement
    private cardContainer: HTMLDivElement
    private loader: DataLoader
    private refresh: AwesomeRefreshButton
    private userMessages: UserMessages

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.computerListCache = CACHE.getComputersList()

        this.userMessages = new UserMessages()

        this.loader = new DataLoader(async (force) => {
            this.computer = await this.computerCache.get(force)
            this.status = await this.statusCache.get(force)
            this.isUserLogged = await this.isUserLoggedCache.get(force)
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        mix_panel.track('Computer View', {uuid: this.uuid})
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
        setTitle({section: 'Computer'})
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.run.page',
                {style: {width: `${this.actualWidth}px`}}, $ => {
                    this.userMessages.render($)
                    this.ButtonsContainer = $('span', '.float-right')
                    $('div', '.nav-container', $ => {
                        new BackButton({text: 'Computers', parent: this.constructor.name}).render($)
                        this.refresh.render($)
                    })
                    this.computerHeaderCard = new ComputerHeaderCard({
                        uuid: this.uuid,
                        width: this.actualWidth,
                        lastUpdated: this.lastUpdated,
                        clickable: true
                    })
                    this.loader.render($)
                    this.computerHeaderCard.render($)
                    this.cardContainer = $('div')
                })
        })

        try {
            await this.loader.load()

            setTitle({section: 'Computer', item: this.computer.name})
            this.renderButtons()
            this.renderCards()
        } catch (e) {
            handleNetworkErrorInplace(e)
        } finally {
            if (this.status && this.status.isRunning) {
                this.refresh.attachHandler(this.computerHeaderCard.renderLastRecorded.bind(this.computerHeaderCard))
                this.refresh.start()
            }
        }
    }

    private renderCards() {
        $(this.cardContainer, $ => {
            computerAnalyses.map((analysis, i) => {
                let card: Card = new analysis.card({uuid: this.uuid, width: this.actualWidth})
                this.cards.push(card)
                card.render($)
            })
        })
    }

    renderButtons() {
        this.ButtonsContainer.innerHTML = ''
        $(this.ButtonsContainer, $ => {
            if (!this.computer.is_claimed) {
                new CustomButton({
                    onButtonClick: this.onSessionAction.bind(this, true),
                    text: 'Claim',
                    parent: this.constructor.name
                }).render($)
            } else if (!this.computer.is_project_session || !this.isUserLogged.is_user_logged) {
                new CustomButton({
                    onButtonClick: this.onSessionAction.bind(this, false),
                    text: 'Add',
                    parent: this.constructor.name
                }).render($)
            }
        })
    }

    async onSessionAction(isSessionClaim: boolean) {
        if (!this.isUserLogged.is_user_logged) {
            mix_panel.track('Claim Button Click', {uuid: this.uuid, analysis: this.constructor.name})
            ROUTER.navigate(`/login#return_url=${window.location.pathname}`)
        } else {
            try {
                if (isSessionClaim) {
                    await this.computerListCache.claimSession(this.computer)
                    this.userMessages.successMessage('Successfully claimed and added to your computers list')
                    this.computer.is_claimed = true
                } else {
                    await this.computerListCache.addSession(this.computer)
                    this.userMessages.successMessage('Successfully added to your computers list')
                }

                this.computer.is_project_session = true
                this.renderButtons()
            } catch (e) {
                this.userMessages.networkErrorMessage()
                return
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
            this.computerHeaderCard.refresh(this.lastUpdated).then()
        }
    }

    onVisibilityChange() {
        this.refresh.changeVisibility(!document.hidden)
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
