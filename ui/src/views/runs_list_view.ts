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
import isMobile from '../utils/mobile';

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

        this.loader = new Loader(true)
        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete})
        this.editButton = new EditButton({onButtonClick: this.onEdit})
        this.refreshButton = new RefreshButton({onButtonClick: this.onRefresh})
        this.cancelButton = new CancelButton({onButtonClick: this.onCancel})

        this.searchQuery = ''
        this.isEditMode = false
        this.runsDeleteSet = new Set<string>()
    }

    render() {
        this.elem = $('div', $ => {
            new HamburgerMenuView({
                title: 'Runs',
                setButtonContainer: container => this.buttonContainer = container
            }).render($)

            $('div', '.runs-list', $ => {
                new SearchView({onSearch: this.onSearch}).render($)
                this.runsListContainer = $('div', '.list.runs-list.list-group', '')
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
                    this.deleteButton.render($)
                    this.cancelButton.render($)
                } else {
                    this.editButton.render($)
                    this.refreshButton.render($)
                }
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
        this.deleteButton.disabled = this.runsDeleteSet.size === 0
        this.renderButtons()
    }

    onDelete = async () => {
        await this.runListCache.deleteRuns(this.runsDeleteSet)
        await this.renderList()
    }

    onCancel = () => {
        this.isEditMode = false
        this.runsDeleteSet.clear()
        this.renderList().then()
    }

    onItemClicked = (elem: RunsListItemView) => {
        let uuid = elem.item.run_uuid
        if (!this.isEditMode) {
            setTimeout(args => {
                ROUTER.navigate(`/run/${uuid}`)
            }, isMobile ? 100 : 0)
            return
        }

        if (this.runsDeleteSet.has(uuid)) {
            this.runsDeleteSet.delete(uuid)
            elem.elem.classList.remove('selected')
        } else {
            this.runsDeleteSet.add(uuid)
            elem.elem.classList.add('selected')
        }
        this.deleteButton.disabled = this.runsDeleteSet.size === 0
    }

    onSearch = (query: string) => {
        this.searchQuery = query
        this.renderList().then()
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

}

export class RunsListHandler {
    constructor() {
        ROUTER.route('runs', [this.handleRunsList])
    }

    handleRunsList = () => {
        SCREEN.setView(new RunsListView())
    }
}
