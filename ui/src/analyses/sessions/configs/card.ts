import {Weya as $, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {Session} from "../../../models/session"
import CACHE, {SessionCache} from "../../../cache/cache"
import {Card, CardOptions} from "../../types"
import {DataLoader} from "../../../components/loader"
import {Configs} from "./components"
import {ROUTER} from '../../../app'

export class SessionConfigsCard extends Card {
    session: Session
    uuid: string
    width: number
    sessionCache: SessionCache
    elem: HTMLDivElement
    configsContainer: HTMLDivElement
    private loader: DataLoader

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.sessionCache = CACHE.getSession(this.uuid)
        this.loader = new DataLoader(async (force) => {
            this.session = await this.sessionCache.get(force)
        })
    }

    getLastUpdated(): number {
        return this.sessionCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div','.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3','.header', 'Configurations')
            this.loader.render($)
            this.configsContainer = $('div')
        })

        try {
            await this.loader.load()

            if (this.session.configs.length > 0) {
                this.renderConfigs()
            } else {
                this.elem.classList.add('hide')
            }
        } catch (e) {

        }
    }

    async refresh() {
        try {
            await this.loader.load(true)
            if (this.session.configs.length > 0) {
                this.renderConfigs()
                this.elem.classList.remove('hide')
            }
        } catch (e) {

        }
    }

    renderConfigs() {
        this.configsContainer.innerHTML = ''
        $(this.configsContainer, $ => {
            new Configs({configs: this.session.configs, width: this.width}).render($)
        })
    }

    onClick = () => {
        ROUTER.navigate(`/session/${this.uuid}/configs`)
    }
}
