import {ScreenView} from "../../../screen"
import {Weya as $, WeyaElement} from "../../../../../lib/weya/weya"
import {ROUTER, SCREEN} from "../../../app"
import {Run} from "../../../models/run"
import CACHE, {ComputerCache, ComputersListCache, ComputerStatusCache, IsUserLoggedCache} from "../../../cache/cache"
import {Status} from "../../../models/status"
import {BackButton, CancelButton, CustomButton, DeleteButton, EditButton, SaveButton} from "../../../components/buttons"
import EditableField from "../../../components/editable_field"
import {formatTime, getTimeDiff} from "../../../utils/time"
import {DataLoader} from "../../../components/loader"
import {StatusView} from "../../../components/status"
import mix_panel from "../../../mix_panel"
import {IsUserLogged} from '../../../models/user'
import {handleNetworkError, handleNetworkErrorInplace} from '../../../utils/redirect'
import {Computer} from "../../../models/computer"
import {setTitle} from '../../../utils/document'
import {UserMessages} from "../../../components/alert"

class ComputerHeaderView extends ScreenView {
    elem: HTMLDivElement
    computer: Computer
    computerCache: ComputerCache
    computerListCache: ComputersListCache
    status: Status
    statusCache: ComputerStatusCache
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    isEditMode: boolean
    uuid: string
    actualWidth: number
    nameField: EditableField
    commentField: EditableField
    isProjectSession: boolean = false
    addToComputersContainer: HTMLSpanElement
    private fieldContainer: HTMLDivElement
    private deleteButton: DeleteButton
    private loader: DataLoader
    private userMessages: UserMessages

    constructor(uuid: string) {
        super()
        this.uuid = uuid
        this.computerCache = CACHE.getComputer(this.uuid)
        this.statusCache = CACHE.getComputerStatus(this.uuid)
        this.isUserLoggedCache = CACHE.getIsUserLogged()
        this.computerListCache = CACHE.getComputersList()
        this.isEditMode = false

        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete.bind(this), parent: this.constructor.name})
        this.userMessages = new UserMessages()

        this.loader = new DataLoader(async (force) => {
            this.status = await this.statusCache.get(force)
            this.computer = await this.computerCache.get(force)
            this.isUserLogged = await this.isUserLoggedCache.get(force)

            if (this.isUserLogged.is_user_logged) {
                let computers = (await this.computerListCache.get(force)).computers
                for (let c of computers) {
                    if (c.session_uuid == this.computer.session_uuid) {
                        this.isProjectSession = true
                        break
                    }
                }
            }
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
        setTitle({section: 'Computer Details'})
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', '.page',
                {style: {width: `${this.actualWidth}px`}},
                $ => {
                    this.userMessages.render($)
                    $('div', $ => {
                        $('div', '.nav-container', $ => {
                            new BackButton({text: 'Run', parent: this.constructor.name}).render($)
                            this.addToComputersContainer = $('span', '.float-right')
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
                        $('h2', '.header.text-center', 'Computer Details')
                        this.loader.render($)
                        this.fieldContainer = $('div', '.input-list-container')
                    })
                })
        })

        try {
            await this.loader.load()

            setTitle({section: 'Computer Details', item: this.computer.name})
            this.renderAddToComputersButton()
            this.renderFields()
        } catch (e) {
            handleNetworkErrorInplace(e)
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
        this.deleteButton.hide(!(this.isUserLogged.is_user_logged && this.computer.is_claimed))
    }

    renderAddToComputersButton() {
        this.addToComputersContainer.innerHTML = ''
        $(this.addToComputersContainer, $ => {
            if (!this.isProjectSession) {
                new CustomButton({
                    onButtonClick: this.onAddToComputers.bind(this),
                    text: 'add to computers',
                    parent: this.constructor.name
                }).render($)
            }
        })
    }

    async onAddToComputers() {
        try {
            await this.computerListCache.addSession(this.computer)
            this.isProjectSession = true
            this.userMessages.successMessage('Successfully added to your computers list')
            this.renderAddToComputersButton()
        } catch (e) {
            this.userMessages.NetworkErrorMessage()
            return
        }
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
