import {WeyaElementFunction, Weya, WeyaElement} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import Card from "../../card"
import Filter from "../../../utils/ansi_to_html"


export class LoggerCard extends Card {
    run: Run
    uuid: string
    runCache: RunCache
    output: HTMLPreElement
    elem: WeyaElement

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.runCache = CACHE.getRun(this.uuid)
    }

    filter = new Filter({})

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
            $('h3.header', 'Standard Logger')
        })

        this.run = await this.runCache.get()

        if (this.run.logger) {
            Weya(this.elem, $ => {
                $('div.terminal-card.no-scroll', $ => {
                    this.output = <HTMLPreElement>$('pre', '')
                })
            })
            this.output.innerHTML = this.filter.toHtml(this.getLastTenLines(this.run.logger))
        } else {
            this.elem.classList.add('no-display')
        }
    }

    refresh() {
    }

    onClick = () => {
        ROUTER.navigate(`/logger/${this.uuid}`)
    }

}