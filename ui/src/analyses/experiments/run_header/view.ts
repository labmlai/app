import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {RunCache, RunStatusCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, SaveButton, CancelButton, EditButton} from "../../../components/buttons"
import EditableField from "../../../components/editable_field"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Loader} from "../../../components/loader"
import {getWindowDimensions} from "../../../utils/window_dimentions"


class RunHeaderView extends ScreenView {
    elem: WeyaElement
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isEditMode: boolean
    runHeaderView: HTMLDivElement
    loader: Loader
    uuid: string
    actualWidth: number

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isEditMode = false
        this.loader = new Loader()
    }

    onResize(width: number) {
        this.actualWidth = Math.min(800, width)
    }

    render() {
        this.elem = $('div.page',
            {style: {width: `${this.actualWidth}px`}},
            $ => {
                this.runHeaderView = <HTMLDivElement>$('div', '')
            })

        this.elem.appendChild(this.loader.render($))

        this.renderRunHeader().then()

        return this.elem
    }

    async renderRunHeader() {
        this.run = await this.runCache.get()
        this.status = await this.statusCache.get()

        this.loader.remove()

        this.runHeaderView.innerHTML = ''

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
            $('h2.header.text-center', 'Run Details')
            $('div.input-list-container', $ => {
                $('ul', $ => {
                    if (this.run && this.status) {
                        new EditableField({
                            name: 'Run Name',
                            value: this.run.name,
                            isEditable: this.isEditMode
                        }).render($)
                        new EditableField({
                            name: 'Comment',
                            value: this.run.comment,
                            isEditable: this.isEditMode
                        }).render($)
                        new EditableField({
                            name: 'Note',
                            value: this.run.note,
                            placeholder: 'write your note here',
                            numEditRows: 5,
                            isEditable: this.isEditMode
                        }).render($)
                        new EditableField({
                            name: 'UUID',
                            value: this.run.run_uuid,
                        }).render($)
                        new EditableField({
                            name: 'Start Time',
                            value: formatTime(this.run.start_time),
                        }).render($)
                        new EditableField({
                            name: 'Last Recorded',
                            value: this.status.isRunning ? getTimeDiff(this.status.last_updated_time * 1000) :
                                formatTime(this.status.last_updated_time),
                        }).render($)
                        new EditableField({
                            name: 'Start Step',
                            value: this.run.start_step
                        }).render($)
                        new EditableField({
                            name: 'Python File',
                            value: this.run.python_file
                        }).render($)
                        new EditableField({
                            name: 'Commit Message',
                            value: this.run.commit_message
                        }).render($)
                    }
                })
            })
        })
    }

    onToggleEdit = () => {
        this.isEditMode = !this.isEditMode
        console.log(typeof this)


        this.renderRunHeader().then()
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
