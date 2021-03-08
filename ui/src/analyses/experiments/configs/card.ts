import {Weya, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {Card, CardOptions} from "../../types"
import {Loader} from "../../../components/loader"
import {Configs} from "./components"
import {ROUTER} from '../../../app'
import {ErrorMessage} from '../../../components/error_message'

export class ConfigsCard extends Card {
    run: Run
    uuid: string
    width: number
    runCache: RunCache
    elem: HTMLDivElement
    configsContainer: HTMLDivElement
    loader: Loader
    errorMessage: ErrorMessage

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.width = opt.width
        this.runCache = CACHE.getRun(this.uuid)
        this.loader = new Loader()
        this.errorMessage = new ErrorMessage()
    }

    getLastUpdated(): number {
        return this.runCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3', '.header', 'Configurations')
        })

        this.elem.appendChild(this.loader.render($))

        Weya(this.elem, $ => {
            this.configsContainer = $('div')
        })

        try {
            this.run = await this.runCache.get()
        } catch (e) {
            this.loader.remove()
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.run.configs.length > 0) {
            this.renderConfigs()
        } else {
            this.elem.classList.add('hide')
        }
    }

    async refresh() {
        if (this.errorMessage.isVisible) {
            this.errorMessage.remove()
            Weya(this.elem, $ => {
                this.loader.render($)
            })
        }
        try {
            this.run = await this.runCache.get(true)
        } catch (e) {
            this.loader.remove()
            this.configsContainer.innerHTML = ''
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.run.configs.length > 0) {
            this.renderConfigs()
            this.elem.classList.remove('hide')
        }
    }

    renderConfigs() {
        this.configsContainer.innerHTML = ''
        Weya(this.configsContainer, $ => {
            new Configs({configs: this.run.configs, width: this.width, isHyperParamOnly: true}).render($)
        })
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/configs`)
    }
}
