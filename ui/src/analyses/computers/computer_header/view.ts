import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {ComputerCache, ComputerStatusCache, IsUserLoggedCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, CancelButton, DeleteButton, EditButton, SaveButton} from "../../../components/buttons"
import EditableField from "../../../components/editable_field"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {DataLoader} from "../../../components/loader"
import {StatusView} from "../../../components/status"
import mix_panel from "../../../mix_panel"
import {IsUserLogged} from '../../../models/user'
import {handleNetworkError} from '../../../utils/redirect'
import {Computer} from "../../../models/computer"

class ComputerHeaderView extends ScreenView {
    elem: HTMLDivElement
    computer: Computer
    computerCache: ComputerCache
    status: Status
    statusCache: ComputerStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    isEditMode: boolean
    uuid: string
    actualWidth: number
    nameField: EditableField
    commentField: EditableField
    private fieldContainer: HTMLDivElement
    private deleteButton: DeleteButton
    private loader: DataLoader

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.isEditMode = false

        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete.bind(this), parent: this.constructor.name})

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.computer = await this.computerCache.get(force)
            this.isUserLogged = await this.isUserLoggedCache.get(force)
        })

        mix_panel.track('Analysis View', {uuid: this.uuid, analysis: this.constructor.name})
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
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.page',
                {style: {width: `${this.actualWidth}px`}},
                $ => {
                    $('div', $ => {
                        $('div', '.nav-container', $ => {
                            new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                            if (this.isEditMode) {
                                new CancelButton({
                                    onButtonClick: this.onToggleEdit,
                                    parent: this.constructor.name
                                }).render($)
                                new SaveButton({onButtonClick: this.updateRun, parent: this.constructor.name}).render($)
                                this.deleteButton.render($)
                                this.deleteButton.hide(true)
                            } else {
                                new EditButton({
                                    onButtonClick: this.onToggleEdit,
                                    parent: this.constructor.name
                                }).render($)
                            }
                        })
                        $('h2', '.header.text-center', 'Run Details')
                        this.loader.render($)
                        this.fieldContainer = $('div', '.input-list-container')
                    })
                })
        })

        try {
            await this.loader.load()

            this.renderFields()
        } catch (e) {

        } finally {

        }
    }

    render(): WeyaElement {
        this.elem = $('div')

        this._render().then()

        return this.elem
    }

    renderFields() {
        this.fieldContainer.innerHTML = ''
        $(this.fieldContainer, $ => {
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
                        new StatusView({status: this.status.run_status}).render($)
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
    }

    onToggleEdit = () => {
        this.isEditMode = !this.isEditMode

        this._render().then()
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
