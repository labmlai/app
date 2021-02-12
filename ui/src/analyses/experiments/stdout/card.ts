import {WeyaElementFunction} from '../../../../../lib/weya/weya'
import {ROUTER} from '../../../app'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {CardOptions} from "../../types"
import Filter from "../../../utils/ansi_to_html"


export class StdOutCard {
    run: Run
    uuid: string
    runCache: RunCache
    output: HTMLDivElement

    constructor(opt: CardOptions) {
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
        this.LoadData().then(() => {
            $('div.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
                $('h3.header', 'Standard Output')
                $('div.terminal-card.no-scroll', $ => {
                    this.output = <HTMLDivElement>$('pre', '')
                })
            })
        })
    }

    private async LoadData() {
        this.run = await this.runCache.get()
    }

    onClick = () => {
        // ROUTER.navigate(`/run_header/${this.uuid}`)
    }

}