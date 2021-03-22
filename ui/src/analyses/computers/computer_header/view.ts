import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {ComputerCache, IsUserLoggedCache, ComputerStatusCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, CancelButton, DeleteButton, EditButton, SaveButton} from "../../../components/buttons"
import EditableField from "../../../components/editable_field"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {Loader} from "../../../components/loader"
import {StatusView} from "../../../components/status"
import mix_panel from "../../../mix_panel"
import {IsUserLogged} from '../../../models/user'
import {handleNetworkError} from '../../../utils/redirect'
import {Computer} from "../../../models/computer"

class ComputerHeaderView extends ScreenView {
    elem: WeyaElement
    computer: Computer
    computerCache: ComputerCache
    status: Status
    statusCache: ComputerStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    isEditMode: boolean
    ComputerHeaderView: HTMLDivElement
    loader: Loader
    uuid: string
    actualWidth: number
    nameField: EditableField
    commentField: EditableField
    noteField: EditableField

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
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
                this.ComputerHeaderView = <HTMLDivElement>$('div', '')
            })

        this.elem.appendChild(this.loader.render($))

        this.renderComputerHeader().then()

        return this.elem
    }

    async renderComputerHeader() {
        try {
            this.computer = await this.computerCache.get()
            this.status = await this.statusCache.get()
            this.isUserLogged = await this.isUserLoggedCache.get()
        } catch (e) {
            handleNetworkError(e)
            return
        }

        this.loader.remove()

        this.ComputerHeaderView.innerHTML = ''

        $(this.ComputerHeaderView, $ => {
            $('div.nav-container', $ => {
                new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                if (this.isEditMode) {
                    new CancelButton({onButtonClick: this.onToggleEdit, parent: this.constructor.name}).render($)
                    new SaveButton({onButtonClick: this.updateRun, parent: this.constructor.name}).render($)
                    if (this.isUserLogged.is_user_logged && this.computer.is_claimed) {
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
                        value: this.computer.name,
                        isEditable: this.isEditMode
                    })
                    this.nameField.render($)
                    this.commentField = new EditableField({
                        name: 'Comment',
                        value: this.computer.comment,
                        isEditable: this.isEditMode
                    })
                    this.commentField.render($)
                    $(`li`, $ => {
                        $('span.item-key', 'Run Status')
                        $('span.item-value', $ => {
                            new StatusView({status: this.status.run_status, type: 'computer'}).render($)
                        })
                    })
                    new EditableField({
                        name: 'Computer UUID',
                        value: this.computer.computer_uuid,
                    }).render($)
                    new EditableField({
                        name: 'Session UUID',
                        value: this.computer.session_uuid,
                    }).render($)
                    new EditableField({
                        name: 'Start Time',
                        value: formatTime(this.computer.start_time),
                    }).render($)
                    new EditableField({
                        name: 'Last Recorded',
                        value: this.status.isRunning ? getTimeDiff(this.status.last_updated_time * 1000) :
                            formatTime(this.status.last_updated_time),
                    }).render($)
                })
            })
        })
    }

    onToggleEdit = () => {
        this.isEditMode = !this.isEditMode

        this.renderComputerHeader().then()
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

    updateRun = () => {
        if (this.nameField.getInput()) {
            this.computer.name = this.nameField.getInput()
        }

        if (this.commentField.getInput()) {
            this.computer.comment = this.commentField.getInput()
        }

        this.computerCache.setComputer(this.computer).then()
        this.onToggleEdit()
    }
}

export class ComputerHeaderHandler {
    constructor() {
        ROUTER.route('session/:uuid/header', [this.handleComputerHeader])
    }

    handleComputerHeader = (uuid: string) => {
        SCREEN.setView(new ComputerHeaderView(uuid))
    }
}
