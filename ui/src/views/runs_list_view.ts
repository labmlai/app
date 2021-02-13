import {IsUserLogged} from '../models/user'
import {ROUTER, SCREEN} from '../app'
import {Weya as $, WeyaElement} from '../../../lib/weya/weya'
import {ScreenView} from "../screen"
import {Loader} from "../components/loader"
import CACHE, {IsUserLoggedCache, RunsListCache} from "../cache/cache"
import {RunsListModel} from '../models/run_list';
import {ListItemView} from '../components/list_item';

class RunsListView implements ScreenView {
    runListCache: RunsListCache
    currentRunsList: RunsListModel
    isUserLogged: IsUserLogged
    isUserLoggedCache: IsUserLoggedCache
    elem: WeyaElement
    runsListContainer: HTMLDivElement
    loader: Loader

    constructor() {
        this.runListCache = CACHE.getRunsList()
        this.isUserLoggedCache = CACHE.getIsUserLogged()

        this.loader = new Loader()
    }

    render() {
        this.elem = <HTMLElement>$('div.runs-list', $ => {
            this.runsListContainer = <HTMLDivElement>$('div.list', '')
            this.loader.render($)
        })

        this.renderList().then()

        return this.elem
    }

    destroy() {

    }

    private async renderList() {
        this.currentRunsList = await this.runListCache.get()
        this.isUserLogged = await this.isUserLoggedCache.get()

        this.loader.remove()

        $(this.runsListContainer, $ => {
            for(let i = 0; i < this.currentRunsList.runs.length; i++){
                new ListItemView({item: this.currentRunsList.runs[i], onClick: this.onItemClicked}).render($)
            }
        })
    }

    onRefresh() {

    }

    onItemClicked = (uuid: string) => {
        ROUTER.navigate(`/run/${uuid}`)
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
