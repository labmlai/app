import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {RunsListCache} from "../cache/cache"
import {RunListItemModel} from '../models/run_list'
import {RunsListItemView} from '../components/runs_list_item'
import {SearchView} from '../components/search';
import {CancelButton, DeleteButton, EditButton, RefreshButton} from '../components/buttons';
import {HamburgerMenuView} from '../components/hamburger_menu';

class RunsListView extends ScreenView {
    runListCache: RunsListCache
    currentRunsList: RunListItemModel[]
    elem: WeyaElement
    runsListContainer: HTMLDivElement
    loader: Loader
    searchQuery: string
    buttonContainer: WeyaElement
    deleteButton: DeleteButton
    editButton: EditButton
    refreshButton: RefreshButton
    cancelButton: CancelButton
    isEditMode: boolean
    runsDeleteSet: Set<string>

    constructor() {
        super()

        this.runListCache = CACHE.getRunsList()

        this.loader = new Loader()
        this.searchQuery = ''
        this.isEditMode = false
        this.runsDeleteSet = new Set<string>()
    }

    render() {
        this.elem = $('div', $ => {
            new HamburgerMenuView({}).render($)
            this.buttonContainer = $('div.button-container', $ => {
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
            $('div', '.runs-list', $ => {
                new SearchView({onSearch: this.onSearch}).render($)
                this.runsListContainer = $('div', '.list', '')
            })
            this.loader.render($)
        })

        this.renderList().then()

        return this.elem
    }

    renderButtons() {
        this.buttonContainer.innerHTML = ''
        $(this.buttonContainer, $ => {
            if (this.currentRunsList.length) {
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
        this.currentRunsList = (await this.runListCache.get()).runs

        let re = new RegExp(this.searchQuery.toLowerCase(), 'g')
        this.currentRunsList = this.currentRunsList.filter(run => this.runsFilter(run, re))

        this.loader.remove()
        this.renderButtons()


        this.runsListContainer.innerHTML = ''
        $(this.runsListContainer, $ => {
            for (let i = 0; i < this.currentRunsList.length; i++) {
                new RunsListItemView({item: this.currentRunsList[i], onClick: this.onItemClicked}).render($)
            }
        })
    }

    runsFilter = (run: RunListItemModel, query: RegExp) => {
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

        return (name.search(query) !== -1 || comment.search(query) !== -1)
    }

    onRefresh = async () => {
        this.currentRunsList = (await this.runListCache.get(true)).runs
        await this.renderList()
    }

    onEdit = () => {
        this.isEditMode = true
        this.renderButtons()
    }

    onDelete = async () => {
        await this.runListCache.deleteRuns(this.runsDeleteSet)
        await this.renderList()
    }

    onCancel = () => {
        this.isEditMode = false
        this.renderButtons()
    }

    onItemClicked = (elem: RunsListItemView) => {
        let uuid = elem.item.run_uuid
        if (!this.isEditMode) {
            ROUTER.navigate(`/run/${uuid}`)
            return
        }

        if (this.runsDeleteSet.has(uuid)) {
            this.runsDeleteSet.delete(uuid)
            elem.elem.classList.remove('selected')
            return
        }

        this.runsDeleteSet.add(uuid)
        elem.elem.classList.add('selected')

    }

    onSearch = (query: string) => {
        this.searchQuery = query
        this.renderList().then()
    }

}

export class RunsListHandler {
    constructor() {
        ROUTER.route('runs', [this.handleRunsList])
    }

    handleRunsList = () => {
        SCREEN.setView(new RunsListView())
    }
}
