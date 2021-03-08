import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {IsUserLoggedCache, RunCache, RunStatusCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, CancelButton, DeleteButton, EditButton, SaveButton} from "../../../components/buttons"
import EditableField from "../../../components/editable_field"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Loader} from "../../../components/loader"
import {BadgeView} from "../../../components/badge"
import {StatusView} from "../../../components/status"
import mix_panel from "../../../mix_panel"
import {IsUserLogged} from '../../../models/user'
import {handleNetworkError} from '../../../utils/redirect'

class RunHeaderView extends ScreenView {
    elem: WeyaElement
    run: Run
    runCache: RunCache
    status: Status
    statusCache: RunStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    isEditMode: boolean
    runHeaderView: HTMLDivElement
    loader: Loader
    uuid: string
    actualWidth: number
    nameField: EditableField
    commentField: EditableField
    noteField: EditableField

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.statusCache = CACHE.getRunStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.isEditMode = false
        this.loader = new Loader(true)

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
    }

    get requiresAuth(): boolean {
        return false
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
        try {

            this.run = await this.runCache.get()
            this.status = await this.statusCache.get()
            this.isUserLogged = await this.isUserLoggedCache.get()
        } catch (e) {
            handleNetworkError(e)
            return
        }

        this.loader.remove()

        this.runHeaderView.innerHTML = ''

        $(this.runHeaderView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                if (this.isEditMode) {
                    new CancelButton({onButtonClick: this.onToggleEdit, parent: this.constructor.name}).render($)
                    new SaveButton({onButtonClick: this.updateRun, parent: this.constructor.name}).render($)
                    if (this.isUserLogged.is_user_logged && this.run.is_claimed) {
                        new DeleteButton({
                            onButtonClick: this.onDelete.bind(this),
                            parent: this.constructor.name
                        }).render($)
                    }
                } else {
                    new EditButton({onButtonClick: this.onToggleEdit, parent: this.constructor.name}).render($)
                }
            })
            $('h2.header.text-center', 'Run Details')
            $('div.input-list-container', $ => {
                $('ul', $ => {
                    this.nameField = new EditableField({
                        name: 'Run Name',
                        value: this.run.name,
                        isEditable: this.isEditMode
                    })
                    this.nameField.render($)
                    this.commentField = new EditableField({
                        name: 'Comment',
                        value: this.run.comment,
                        isEditable: this.isEditMode
                    })
                    this.commentField.render($)
                    $(`li`, $ => {
                        $('span.item-key', 'Tags')
                        $('span.item-value', $ => {
                            $('div', $ => {
                                this.run.tags.map((tag, idx) => (
                                    new BadgeView({text: tag}).render($)
                                ))
                            })
                        })
                    })
                    this.noteField = new EditableField({
                        name: 'Note',
                        value: this.run.note,
                        placeholder: 'write your note here',
                        numEditRows: 5,
                        isEditable: this.isEditMode
                    })
                    this.noteField.render($)
                    $(`li`, $ => {
                        $('span.item-key', 'Run Status')
                        $('span.item-value', $ => {
                            new StatusView({status: this.status.run_status}).render($)
                        })
                    })
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
                    $(`li`, $ => {
                        $('span.item-key', 'Remote Repo')
                        $('span.item-value', $ => {
                            $('a', this.run.repo_remotes, {
                                href: this.run.repo_remotes,
                                target: "_blank",
                                rel: "noopener noreferrer"
                            })
                        })
                    })
                    $(`li`, $ => {
                        $('span.item-key', 'Commit')
                        $('span.item-value', $ => {
                            $('a', this.run.commit, {
                                href: this.run.commit,
                                target: "_blank",
                                rel: "noopener noreferrer"
                            })
                        })
                    })
                    new EditableField({
                        name: 'Commit Message',
                        value: this.run.commit_message
                    }).render($)
                })
            })
        })
    }

    onToggleEdit = () => {
        this.isEditMode = !this.isEditMode

        this.renderRunHeader().then()
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

    updateRun = () => {
        if (this.nameField.getInput()) {
            this.run.name = this.nameField.getInput()
        }

        if (this.commentField.getInput()) {
            this.run.comment = this.commentField.getInput()
        }

        if (this.noteField.getInput()) {
            this.run.note = this.noteField.getInput()
        }

        this.runCache.setRun(this.run).then()
        this.onToggleEdit()
    }
}

export class RunHeaderHandler {
    constructor() {
        ROUTER.route('run/:uuid/header', [this.handleRunHeader])
    }

    handleRunHeader = (uuid: string) => {
        SCREEN.setView(new RunHeaderView(uuid))
    }
}
