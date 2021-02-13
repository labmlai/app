import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import Card from "../../card"
import Filter from "../../../utils/ansi_to_html"


export class StdErrorCard extends Card {
    run: Run
    uuid: string
    runCache: RunCache
    output: HTMLDivElement

    constructor(opt: CardOptions) {
        super()

        this.uuid = opt.uuid
        this.runCache = CACHE.getRun(this.uuid)
    }

    f = new Filter({})

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

    render($: WeyaElementFunction) {
        this.loadData().then(() => {
            $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
                $('h3.header', 'Standard Error')
                $('div.terminal-card.no-scroll', $ => {
                    this.output = <HTMLDivElement>$('pre', '')
                })
            })
            this.output.innerHTML = this.f.toHtml(this.getLastTenLines(this.run.stderr))
        })
    }

    protected async loadData() {
        this.run = await this.runCache.get()
    }

    refresh() {
    }

    onClick = () => {
        ROUTER.navigate(`/stderr/${this.uuid}`)
    }

}