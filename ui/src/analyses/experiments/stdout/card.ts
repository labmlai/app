import {WeyaElement, WeyaElementFunction, Weya} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import Card from "../../card"
import Filter from "../../../utils/ansi_to_html"
import {Loader} from "../../../components/loader"


export class StdOutCard extends Card {
    run: Run
    uuid: string
    runCache: RunCache
    outputContainer: WeyaElement
    elem: WeyaElement
    loader: Loader
    filter: Filter

    constructor(opt: CardOptions) {
        super()

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

    async render($: WeyaElementFunction) {
        this.elem = $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3.header', 'Standard Output')
        })

        this.elem.appendChild(this.loader.render($))
        this.run = await this.runCache.get()
        this.loader.remove()

        if (this.run.stdout) {
            Weya(this.elem, $ => {
                $('div.terminal-card.no-scroll', $ => {
                    this.outputContainer = $('pre', '')
                })
            })
            this.renderOutput()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderOutput() {
        this.outputContainer.innerHTML = ''
        Weya(this.outputContainer, $ => {
            let output = $('div', '')
            output.innerHTML = this.getLastTenLines(this.filter.toHtml(this.run.stdout))
        })
    }

    async refresh() {
        this.run = await this.runCache.get(true)

        if (this.run.stdout) {
            this.renderOutput()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/stdout/${this.uuid}`)
    }
}