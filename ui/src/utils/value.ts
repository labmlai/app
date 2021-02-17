import d3 from "../d3"
import {WeyaElementFunction} from "../../../lib/weya/weya";

const FORMAT = d3.format(".3s")

function numberWithCommas(x: string) {
    const parts = x.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
}

export function formatScalar(value: number) {
    let str = value.toFixed(2)
    if (str.length <= 10) {
        str = value.toPrecision(10)
    }

    return numberWithCommas(str)
}

export function formatStep(step: number) {
    return FORMAT(step)
}

export function formatFixed(value: number, decimals: number) {
    if (Math.abs(value) > 10000) {
        return FORMAT(value)
    }

    if (Math.abs(value) > 1) {
        decimals = 3
    }

    let str = value.toFixed(decimals)

    return numberWithCommas(str)
}

export function formatInt(value: number) {
    let str = value.toString()
    return numberWithCommas(str)
}

export function scaleValue(value: number, minValue: number, maxValue: number) {
    value = Math.abs(value)
    minValue = Math.abs(minValue)
    maxValue = Math.abs(maxValue)

    return (value - minValue) / (maxValue - minValue)
}

function FormattedValue($: WeyaElementFunction, value: any) {
    if (typeof value === 'boolean') {
        return $('span.boolean', this.toString())
    } else if (typeof value === 'number') {
        if (value - Math.floor(value) < 1e-9) {
            return $('span.int', formatInt(value))
        } else {
            return $('span.float', formatInt(value))
        }
    } else if (typeof value === 'string') {
        $('span.string', value)
    } else if (value instanceof Array) {
        let elements = [$('span.subtle', '[')]

        for (let i = 0; i < value.length; ++i) {
            if (i > 0) {
                elements.push($('span.subtle', ', '))
            }
        }
        elements.push($('span.subtle', ']'))
        return elements
    } else {
       return $('span.unknown',value)
    }
}

export function pickHex(weight: number) {
    let w1: number = weight
    let w2: number = 1 - w1

    const color1 = [53, 88, 108]
    const color2 = [89, 149, 183]

    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)]

    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

