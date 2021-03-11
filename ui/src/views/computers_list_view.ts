import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {ComputersListCache} from "../cache/cache"
import {SearchView} from '../components/search';
import {CancelButton, DeleteButton, EditButton, RefreshButton} from '../components/buttons'
import {ComputerListItemModel} from '../models/computer_list'
import {ComputersListItemView} from '../components/computers_list_item'
import {HamburgerMenuView} from '../components/hamburger_menu'
import mix_panel from "../mix_panel"
import {handleNetworkError} from '../utils/redirect'
import EmptyComputersList from "./empty_computers_list"
import {AlertMessage} from "../components/alert"


class ComputersListView extends ScreenView {
    computerListCache: ComputersListCache
    currentComputersList: ComputerListItemModel[]
    elem: WeyaElement
    computersListContainer: HTMLDivElement
    btnContainer: HTMLDivElement
    loader: Loader
    searchQuery: string
    buttonContainer: HTMLDivElement
    alertContainer: HTMLDivElement
    deleteButton: DeleteButton
    editButton: EditButton
    refreshButton: RefreshButton
    cancelButton: CancelButton
    isEditMode: boolean
    computersDeleteSet: Set<string>

    constructor() {
        super()

        this.computerListCache = CACHE.getComputersList()

        this.loader = new Loader(true)
        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete, parent: this.constructor.name})
        this.editButton = new EditButton({onButtonClick: this.onEdit, parent: this.constructor.name})
        this.refreshButton = new RefreshButton({onButtonClick: this.onRefresh, parent: this.constructor.name})
        this.cancelButton = new CancelButton({onButtonClick: this.onCancel, parent: this.constructor.name})

        this.searchQuery = ''
        this.isEditMode = false
        this.computersDeleteSet = new Set<string>()

        mix_panel.track('Computers List View')
    }

    render() {
        this.elem = $('div', $ => {
            this.alertContainer = $('div')
            new HamburgerMenuView({
                title: 'Computers',
                setButtonContainer: container => this.buttonContainer = container
            }).render($)

            $('div', '.runs-list', $ => {
                new SearchView({onSearch: this.onSearch}).render($)
                this.computersListContainer = $('div', '.list.runs-list.list-group', '')
            })
            this.loader.render($)
        })

        this.renderList().then()

        return this.elem
    }

    renderButtons() {
        this.buttonContainer.innerHTML = ''
        $(this.buttonContainer, $ => {
            if (this.currentComputersList.length) {
                if (this.isEditMode) {
                    this.deleteButton.render($)
                    this.cancelButton.render($)
                } else {
                    this.editButton.render($)
                    this.refreshButton.render($)
                }
            }
        })
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
        try {
            this.currentComputersList = (await this.computerListCache.get(true)).computers
        } catch (e) {
            //TODO: redirect after multiple refresh failures
            handleNetworkError(e)
            return
        }
        await this.renderList()
    }

    onEdit = () => {
        this.isEditMode = true
        this.deleteButton.disabled = this.computersDeleteSet.size === 0
        this.renderButtons()
    }

    onDelete = async () => {
        this.computerListCache.deleteSessions(this.computersDeleteSet).catch(error => {
            this.renderAlertMessage()
        })

        this.computersDeleteSet.clear()
        this.deleteButton.disabled = this.computersDeleteSet.size === 0

        await this.renderList()
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

    onSearch = (query: string) => {
        this.searchQuery = query
        this.renderList().then()
    }

    private async renderList() {
        try {
            this.currentComputersList = (await this.computerListCache.get()).computers
        } catch (e) {
            handleNetworkError(e)
            return
        }

        this.loader.remove()

        if (this.currentComputersList.length > 0) {
            let re = new RegExp(this.searchQuery.toLowerCase(), 'g')
            this.currentComputersList = this.currentComputersList.filter(computer => this.computersFilter(computer, re))

            this.renderButtons()

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
