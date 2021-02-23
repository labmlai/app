import {CHART_COLORS} from "./constants"
import {WeyaElementFunction} from "../../../../lib/weya/weya"

export default class ChartGradients {
    constructor() {
    }

    render($: WeyaElementFunction) {
        $('defs', $ => {
            $('filter', {id: 'dropshadow'}, $ => {
                $('feGaussianBlur', {in: 'SourceAlpha', stdDeviation: "3"})
                $('feOffset', {dx: '0', dy: "0", result: "offsetblur"})
                $('feComponentTransfer', $ => {
                    $('feFuncA', {slope: '0.2', type: "linear"})
                })
                $('feMerge', $ => {
                    $('feMergeNode')
                    $('feMergeNode', {in: "SourceGraphic"})
                })
            })
            CHART_COLORS.map((c, i) => {
                $('linearGradient', {id: `gradient-${i}`, x1: '0%', x2: '0%', y1: '0%', y2: '100%'}, $ => {
                    $('stop', {offset: '0%', 'stop-color': c, 'stop-opacity': 1.0})
                    $('stop', {offset: '100%', 'stop-color': c, 'stop-opacity': 0.0})
                })
            })
        })
    }
}