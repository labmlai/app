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
import CACHE, {RunCache, IsUserLoggedCache, RunStatusCache} from "../cache/cache"

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

    constructor(uuid: string) {
        this.uuid = '027f53d45ad211ebb1b4acde48001122'
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()
    }

    render() {
        this.elem = <HTMLElement>$('div.run.page', $ => {
            this.runView = <HTMLDivElement>$('div', '')
        })

        this.renderRun().then()

        return this.elem
    }

    destroy() {

    }

    private async renderRun() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()
        this.isUserLogged = await this.isUserLoggedCache.get()

        $(this.runView, $ => {
            if (this.isUserLogged && this.isUserLogged.is_user_logged && this.run && this.run.is_claimed) {
                new AlertMessage('This run will be deleted in 12 hours. Click here to add it to your experiments.').render($)
            }
            $('div.flex-container', $ => {
                new BackButton({
                    onButtonClick: () => {
                    }
                }).render($)
                if (this.status && this.status.isStatusInProgress) {
                    new RefreshButton({
                        onButtonClick: () => {
                        }
                    }).render($)
                }
            })
            new RunHeaderCard({uuid: this.uuid, width: 800}).render($)
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
