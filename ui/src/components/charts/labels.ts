import {WeyaElementFunction} from "../../../../lib/weya/weya"
import {getColor} from "./constants"

interface LabelsOptions {
    labels: string[]
    colorBias?: number
}

export class Labels {
    labels: string[]
    colorBias?: number

    constructor(opt: LabelsOptions) {
        this.labels = opt.labels
        this.colorBias = opt.colorBias
    }

    render($: WeyaElementFunction) {
        $('div.text-center.labels.text-secondary',
            $ => {
                this.labels.map((label, i) => {
                    const colorBias = this.colorBias ? this.colorBias : 0
                    $('span', $ => {
                        $('div.box', {style: {background: getColor(i + colorBias)}})
                    })
                    $('span', label)
                })
            })
    }
}