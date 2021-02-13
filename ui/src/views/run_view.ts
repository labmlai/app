import {Run} from '../models/run'
import {Status} from "../models/status"
import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import {RefreshButton, BackButton} from "../components/buttons"
import {AlertMessage} from "../components/alert"
import {getWindowDimensions} from "../utils/window_dimentions"
import {RunHeaderCard} from "../analyses/experiments/run_header/card"
import {StdOutCard} from "../analyses/experiments/stdout/card"
import CACHE, {RunCache, IsUserLoggedCache, RunStatusCache} from "../cache/cache"
import Timeout = NodeJS.Timeout;

class RunView implements ScreenView {
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    elem: WeyaElement
    runView: HTMLDivElement
    uuid: string
    loader: Loader
    autoRefresh : Timeout
    actualWidth: number

    constructor(uuid: string) {
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()

        this.loader = new Loader()
    }

    handleResize = () => {
        let windowWidth = getWindowDimensions().width
        this.actualWidth = Math.min(800, windowWidth)
    }

    render() {
        this.handleResize()
        window.addEventListener('resize', this.handleResize)

        this.autoRefresh = setInterval(this.renderRun.bind(this), 2 * 60 * 1000)

        this.elem = <HTMLElement>$('div.run.page',
            {style: {width: `${this.actualWidth}px`}},
            $ => {
                this.runView = <HTMLDivElement>$('div', '')
                this.loader.render($)
            })

        this.renderRun().then()

        return this.elem
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize)

        clearInterval(this.autoRefresh)
    }

    private async renderRun() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()
        this.isUserLogged = await this.isUserLoggedCache.get()

        this.loader.remove()

        this.runView.innerHTML = ''

        $(this.runView, $ => {
            if (this.isUserLogged && this.isUserLogged.is_user_logged && this.run && this.run.is_claimed) {
                new AlertMessage('This run will be deleted in 12 hours. Click here to add it to your experiments.').render($)
            }
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                if (this.status && this.status.isStatusInProgress) {
                    new RefreshButton({onButtonClick: this.onRefresh}).render($)
                }
            })
            new RunHeaderCard({uuid: this.uuid, width: this.actualWidth}).render($)
            new StdOutCard({uuid: this.uuid, width: this.actualWidth}).render($)
        })
    }

    onRefresh = () => {

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
