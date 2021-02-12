import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, SaveButton, CancelButton, EditButton} from "../../../components/buttons";

class RunHeaderView implements ScreenView {
    elem: WeyaElement
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isEditMode: boolean
    runHeaderView: HTMLDivElement
    uuid: string

    constructor(uuid: string) {
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isEditMode = false
    }

    render() {
        this.elem = <HTMLElement>$('div.page', $ => {
            this.runHeaderView = <HTMLDivElement>$('div', '')
        })

        this.renderRunHeader().then()

        return this.elem
    }

    destroy() {

    }

    private async renderRunHeader() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()

        $(this.runHeaderView, $ => {
            $('div.flex-container', $ => {
                new BackButton({}).render($)
                if (this.isEditMode) {
                    new CancelButton({onButtonClick: this.onToggleEdit}).render($)
                    new SaveButton({onButtonClick: this.updateRun}).render($)
                } else {
                    new EditButton({onButtonClick: this.onToggleEdit}).render($)
                }
            })
        })
    }

    onToggleEdit() {
        this.isEditMode = !this.isEditMode
    }

    updateRun() {

    }
}

export class RunHeaderHandler {
    constructor() {
        ROUTER.route('run_header/:uuid', [this.handleRunHeader])
    }

    handleRunHeader = (uuid: string) => {
        SCREEN.setView(new RunHeaderView(uuid))
    }
}
