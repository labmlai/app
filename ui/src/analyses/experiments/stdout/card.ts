import {Weya, WeyaElementFunction} from '../../../../../lib/weya/weya'
import {Run} from "../../../models/run"
import CACHE, {RunCache} from "../../../cache/cache"
import {Card, CardOptions} from "../../types"
import Filter from "../../../utils/ansi_to_html"
import {Loader} from "../../../components/loader"
import {ROUTER} from '../../../app'
import {ErrorMessage} from '../../../components/error_message';

export class StdOutCard extends Card {
    run: Run
    uuid: string
    runCache: RunCache
    outputContainer: HTMLPreElement
    elem: HTMLDivElement
    loader: Loader
    filter: Filter
    errorMessage: ErrorMessage

    constructor(opt: CardOptions) {
        super(opt)

        this.uuid = opt.uuid
        this.runCache = CACHE.getRun(this.uuid)
        this.loader = new Loader()
        this.filter = new Filter({})
        this.errorMessage = new ErrorMessage()
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
        this.elem = $('div', '.labml-card.labml-card-action', {on: {click: this.onClick}}, $ => {
            $('h3', '.header', 'Standard Output')
        })

        this.elem.appendChild(this.loader.render($))

        Weya(this.elem, $ => {
            $('div', '.terminal-card.no-scroll', $ => {
                this.outputContainer = $('pre', '')
            })
        })
        try {
            this.run = await this.runCache.get()
        } catch (e) {
            this.loader.remove()
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.run.stdout) {
            this.renderOutput()
        } else {
            this.elem.classList.add('hide')
        }
    }

    renderOutput() {
        this.outputContainer.innerHTML = ''
        Weya(this.outputContainer, $ => {
            let output = $('div', '')
            output.innerHTML = this.filter.toHtml(this.getLastTenLines(this.run.stdout))
        })
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
            this.outputContainer.innerHTML = ''
            this.errorMessage.render(this.elem)
            return
        }
        this.loader.remove()

        if (this.run.stdout) {
            this.renderOutput()
            this.elem.classList.remove('hide')
        }
    }

    onClick = () => {
        ROUTER.navigate(`/run/${this.uuid}/stdout`)
    }
}
