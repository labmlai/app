import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {DataLoader} from "../components/loader"
import CACHE, {ComputersListCache} from "../cache/cache"
import {SearchView} from '../components/search';
import {CancelButton, DeleteButton, EditButton} from '../components/buttons'
import {ComputerListItemModel} from '../models/computer_list'
import {ComputersListItemView} from '../components/computers_list_item'
import {HamburgerMenuView} from '../components/hamburger_menu'
import mix_panel from "../mix_panel"
import EmptyComputersList from "./empty_computers_list"
import {AlertMessage} from "../components/alert"
import {AwesomeRefreshButton} from '../components/refresh_button'
import {handleNetworkErrorInplace} from '../utils/redirect'
import {setTitle} from '../utils/document'

class ComputersListView extends ScreenView {
    computerListCache: ComputersListCache
    currentComputersList: ComputerListItemModel[]
    elem: HTMLDivElement
    computersListContainer: HTMLDivElement
    searchQuery: string
    buttonContainer: HTMLDivElement
    alertContainer: HTMLDivElement
    deleteButton: DeleteButton
    editButton: EditButton
    cancelButton: CancelButton
    isEditMode: boolean
    computersDeleteSet: Set<string>
    private loader: DataLoader
    private refresh: AwesomeRefreshButton

    constructor() {
        super()

        this.computerListCache = CACHE.getComputersList()

        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete, parent: this.constructor.name})
        this.editButton = new EditButton({onButtonClick: this.onEdit, parent: this.constructor.name})
        this.cancelButton = new CancelButton({onButtonClick: this.onCancel, parent: this.constructor.name})

        this.loader = new DataLoader(async (force) => {
            this.currentComputersList = (await this.computerListCache.get(force)).computers
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        this.searchQuery = ''
        this.isEditMode = false
        this.computersDeleteSet = new Set<string>()

        mix_panel.track('Computers List View')
    }

    async _render() {
        setTitle({section: 'Computers'})
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', $ => {
                this.alertContainer = $('div')
                new HamburgerMenuView({
                    title: 'Computers',
                    setButtonContainer: container => this.buttonContainer = container
                }).render($)

                $('div', '.runs-list', $ => {
                    new SearchView({onSearch: this.onSearch}).render($)
                    this.loader.render($)
                    this.computersListContainer = $('div', '.list.runs-list.list-group', '')
                })
            })
        })
        $(this.buttonContainer, $ => {
            this.deleteButton.render($)
            this.cancelButton.render($)
            this.editButton.render($)
            this.refresh.render($)
            this.deleteButton.hide(true)
            this.cancelButton.hide(true)
            this.editButton.hide(true)
        })

        try {
            await this.loader.load()

            this.renderList().then()
        } catch (e) {
            handleNetworkErrorInplace(e)
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

    updateButtons() {
        let noRuns = this.currentComputersList.length == 0
        this.deleteButton.hide(noRuns || !this.isEditMode)
        this.cancelButton.hide(noRuns || !this.isEditMode)
        this.editButton.hide(noRuns || this.isEditMode)
        if (!noRuns && !this.isEditMode) {
            this.refresh.start()
        } else {
            this.refresh.stop()
        }
    }

    renderAlertMessage() {
        this.alertContainer.innerHTML = ''
        $(this.alertContainer, $ => {
            new AlertMessage({message: 'An unexpected network error occurred. Please try again later'}).render($)
        })
    }

    computersFilter = (computer: ComputerListItemModel, query: RegExp) => {
        let name = computer.name.toLowerCase()
        let comment = computer.comment.toLowerCase()

        return (name.search(query) !== -1 || comment.search(query) !== -1)
    }

    onRefresh = async () => {
        this.editButton.disabled = true
        try {
            await this.loader.load(true)

            await this.renderList()
        } catch (e) {

        } finally {
            this.editButton.disabled = false
        }
    }

    onEdit = () => {
        this.isEditMode = true
        this.deleteButton.disabled = this.computersDeleteSet.size === 0
        this.updateButtons()
    }

    onDelete = async () => {
        try {
            await this.computerListCache.deleteSessions(this.computersDeleteSet)

            this.isEditMode = false
            this.computersDeleteSet.clear()
            this.deleteButton.disabled = this.computersDeleteSet.size === 0

            await this.loader.load()
            await this.renderList()
        } catch (e) {
            this.renderAlertMessage()
        }

    }

    onCancel = () => {
        this.isEditMode = false
        this.computersDeleteSet.clear()
        this.renderList().then()
    }

    onItemClicked = (elem: ComputersListItemView) => {
        let uuid = elem.item.session_uuid
        if (!this.isEditMode) {
            ROUTER.navigate(`/session/${uuid}`)
            return
        }

        if (this.computersDeleteSet.has(uuid)) {
            this.computersDeleteSet.delete(uuid)
            elem.elem.classList.remove('selected')
        } else {
            this.computersDeleteSet.add(uuid)
            elem.elem.classList.add('selected')
        }
        this.deleteButton.disabled = this.computersDeleteSet.size === 0
    }

    onSearch = async (query: string) => {
        this.searchQuery = query
        await this.loader.load()
        this.renderList().then()
    }

    private async renderList() {
        if (this.currentComputersList.length > 0) {
            let re = new RegExp(this.searchQuery.toLowerCase(), 'g')
            this.currentComputersList = this.currentComputersList.filter(computer => this.computersFilter(computer, re))

            this.computersListContainer.innerHTML = ''
            $(this.computersListContainer, $ => {
                for (let i = 0; i < this.currentComputersList.length; i++) {
                    new ComputersListItemView({
                        item: this.currentComputersList[i],
                        onClick: this.onItemClicked
                    }).render($)
                }
            })
        } else {
            $(this.computersListContainer, $ => {
                new EmptyComputersList().render($)
            })
        }
        this.updateButtons()
    }

}

export class ComputersListHandler {
    constructor() {
        ROUTER.route('computers', [this.handleComputersList])
    }

    handleComputersList = () => {
        SCREEN.setView(new ComputersListView())
    }
}
