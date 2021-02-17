import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {ComputersListCache, IsUserLoggedCache} from "../cache/cache"
import {SearchView} from '../components/search';
import {CancelButton, DeleteButton, EditButton, RefreshButton} from '../components/buttons';
import {ComputerListItemModel} from '../models/computer_list';
import {ComputersListItemView} from '../components/computers_list_item';

class ComputersListView extends ScreenView {
    computerListCache: ComputersListCache
    currentComputersList: ComputerListItemModel[]
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    elem: WeyaElement
    computersListContainer: HTMLDivElement
    btnContainer: HTMLDivElement
    loader: Loader
    searchQuery: string
    buttonContainer: HTMLDivElement
    deleteButton: DeleteButton
    editButton: EditButton
    refreshButton: RefreshButton
    cancelButton: CancelButton
    isEditMode: boolean
    computersDeleteSet: Set<string>

    constructor() {
        super()

        this.computerListCache = CACHE.getComputersList()
        this.isUserLoggedCache = CACHE.getIsUserLogged()

        this.loader = new Loader()
        this.searchQuery = ''
        this.isEditMode = false
        this.computersDeleteSet = new Set<string>()
    }

    render() {
        this.elem = $('div', $ => {
            this.buttonContainer = <HTMLDivElement>$('div.button-container', $ => {
                this.deleteButton = new DeleteButton({
                    onButtonClick: this.onDelete
                })
                this.editButton = new EditButton({
                    onButtonClick: this.onEdit
                })
                this.refreshButton = new RefreshButton({
                    onButtonClick: this.onRefresh
                })
                this.cancelButton = new CancelButton({
                    onButtonClick: this.onCancel
                })
            })
            $('div.runs-list', $ => {
                new SearchView({onSearch: this.onSearch}).render($)
                this.computersListContainer = <HTMLDivElement>$('div.list', '')
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
                    this.cancelButton.render($)
                    this.deleteButton.render($)
                } else {
                    this.refreshButton.render($)
                    this.editButton.render($)
                }
            }
        })
    }

    private async renderList() {
        this.isUserLogged = await this.isUserLoggedCache.get()
        if (!this.isUserLogged.is_user_logged) {
            ROUTER.navigate(`/login#return_url=/computers`)
            return
        }
        this.currentComputersList = (await this.computerListCache.get()).computers

        let re = new RegExp(this.searchQuery.toLowerCase(), 'g')
        this.currentComputersList = this.currentComputersList.filter(computer => this.computersFilter(computer, re))

        this.loader.remove()
        this.renderButtons()


        this.computersListContainer.innerHTML = ''
        $(this.computersListContainer, $ => {
            for (let i = 0; i < this.currentComputersList.length; i++) {
                new ComputersListItemView({item: this.currentComputersList[i], onClick: this.onItemClicked}).render($)
            }
        })
    }

    computersFilter = (computer: ComputerListItemModel, query: RegExp) => {
        let name = computer.name.toLowerCase()
        let comment = computer.comment.toLowerCase()

        return (name.search(query) !== -1 || comment.search(query) !== -1)
    }

    onRefresh = async () => {
        this.currentComputersList = (await this.computerListCache.get(true)).computers
        await this.renderList()
    }

    onEdit = () => {
        this.isEditMode = true
        this.renderButtons()
    }

    onDelete = async () => {
        await this.computerListCache.deleteSessions(this.computersDeleteSet)
        await this.renderList()
    }

    onCancel = () => {
        this.isEditMode = false
        this.renderButtons()
    }

    onItemClicked = (elem: ComputersListItemView) => {
        let uuid = elem.item.computer_uuid
        if (!this.isEditMode) {
            ROUTER.navigate(`/session/${uuid}`)
            return
        }

        if (this.computersDeleteSet.has(uuid)) {
            this.computersDeleteSet.delete(uuid)
            elem.elem.classList.remove('selected')
            return
        }

        this.computersDeleteSet.add(uuid)
        elem.elem.classList.add('selected')

    }

    onSearch = (query: string) => {
        this.searchQuery = query
        this.renderList().then()
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
