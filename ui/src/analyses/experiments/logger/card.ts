import {Weya, WeyaElement, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {Card, CardOptions} from "../../types"
import Filter from "../../../utils/ansi_to_html"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'


export class LoggerCard extends Card {
    run: Run
    uuid: string
    runCache: RunCache
    outputContainer: WeyaElement
    elem: WeyaElement
    loader: Loader
    filter: Filter

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.loader = new Loader()
        this.filter = new Filter({})
    }

    getLastTenLines(inputStr: string) {
        let split = inputStr.split("\n")

        let last10Lines
        if (split.length > 10) {
            last10Lines = split.slice(Math.max(split.length - 10, 1))
        } else {
            last10Lines = split
        }

        return last10Lines.join("\n")
    }

    getLastUpdated(): number {
        return this.runCache.lastUpdated
    }

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Standard Logger')
        })

        this.elem.appendChild(this.loader.render($))
        try {
            this.run = await this.runCache.get()
        } catch (e) {
            // Let the parent view handle network failures
        }
        this.loader.remove()

        Weya(this.elem, $ => {
            $('div.terminal-card.no-scroll', $ => {
                this.outputContainer = $('pre', '')
            })
        })

        if (this.run.logger) {
            this.renderOutput()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderOutput() {
        this.outputContainer.innerHTML = ''
        Weya(this.outputContainer, $ => {
            let output = $('div', '')
            output.innerHTML = this.filter.toHtml(this.getLastTenLines(this.run.logger))
        })
    }

    async refresh() {
        try {
            this.run = await this.runCache.get(true)
        } catch (e) {
            // Let the parent view handle network failures
        }

        if (this.run.logger) {
            this.renderOutput()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/logger`)
    }
}
