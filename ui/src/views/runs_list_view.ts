import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {DataLoader} from "../components/loader"
import CACHE, {RunsListCache} from "../cache/cache"
import {RunListItemModel} from '../models/run_list'
import {RunsListItemView} from '../components/runs_list_item'
import {SearchView} from '../components/search'
import {CancelButton, DeleteButton, EditButton} from '../components/buttons'
import {HamburgerMenuView} from '../components/hamburger_menu'
import mix_panel from "../mix_panel"
import EmptyRunsList from './empty_runs_list'
import {AlertMessage} from '../components/alert'
import {AwesomeRefreshButton} from '../components/refresh_button'

class RunsListView extends ScreenView {
    runListCache: RunsListCache
    currentRunsList: RunListItemModel[]
    elem: HTMLDivElement
    runsListContainer: HTMLDivElement
    searchQuery: string
    buttonContainer: HTMLDivElement
    alertContainer: HTMLDivElement
    deleteButton: DeleteButton
    editButton: EditButton
    cancelButton: CancelButton
    isEditMode: boolean
    runsDeleteSet: Set<string>
    private loader: DataLoader
    private refresh: AwesomeRefreshButton

    constructor() {
        super()

        this.runListCache = CACHE.getRunsList()

        this.deleteButton = new DeleteButton({onButtonClick: this.onDelete, parent: this.constructor.name})
        this.editButton = new EditButton({onButtonClick: this.onEdit, parent: this.constructor.name})
        this.cancelButton = new CancelButton({onButtonClick: this.onCancel, parent: this.constructor.name})

        this.loader = new DataLoader(async (force) => {
            this.currentRunsList = (await this.runListCache.get(force)).runs
        })
        this.refresh = new AwesomeRefreshButton(this.onRefresh.bind(this))

        this.searchQuery = ''
        this.isEditMode = false
        this.runsDeleteSet = new Set<string>()

        mix_panel.track('Runs List View')
    }

    async _render() {
        this.elem.innerHTML = ''
        $(this.elem, $ => {
            $('div', $ => {
                this.alertContainer = $('div')
                new HamburgerMenuView({
                    title: 'Runs',
                    setButtonContainer: container => this.buttonContainer = container
                }).render($)

                $('div', '.runs-list', $ => {
                    new SearchView({onSearch: this.onSearch}).render($)
                    this.loader.render($)
                    this.runsListContainer = $('div', '.list.runs-list.list-group', '')
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
        let noRuns = this.currentRunsList.length == 0
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

    runsFilter = (run: RunListItemModel, query: RegExp) => {
        let name = run.name.toLowerCase()
        let comment = run.comment.toLowerCase()

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
        this.deleteButton.disabled = this.runsDeleteSet.size === 0
        this.updateButtons()
    }

    onDelete = async () => {
        try {
            await this.runListCache.deleteRuns(this.runsDeleteSet)

            this.isEditMode = false
            this.runsDeleteSet.clear()
            this.deleteButton.disabled = this.runsDeleteSet.size === 0

            await this.loader.load()
            await this.renderList()
        } catch (e) {
            this.renderAlertMessage()
        }
    }

    onCancel = () => {
        this.isEditMode = false
        this.runsDeleteSet.clear()
        this.renderList().then()
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
        if (this.currentRunsList.length > 0) {
            let re = new RegExp(this.searchQuery.toLowerCase(), 'g')
            this.currentRunsList = this.currentRunsList.filter(run => this.runsFilter(run, re))

            this.runsListContainer.innerHTML = ''
            $(this.runsListContainer, $ => {
                for (let i = 0; i < this.currentRunsList.length; i++) {
                    new RunsListItemView({item: this.currentRunsList[i], onClick: this.onItemClicked}).render($)
                }
            })
        } else {
            $(this.runsListContainer, $ => {
                new EmptyRunsList().render($)
            })
        }
        this.updateButtons()
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
