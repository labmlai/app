import React from "react";

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

export function formatFixed(value: number, decimals: number) {
    let str = value.toFixed(decimals)

    return numberWithCommas(str)
}

export function formatInt(value: number) {
    let str = value.toString()
    return numberWithCommas(str)
}

export function FormattedValue(props: { value: any }) {
    let value = props.value

    if (typeof value === 'boolean') {
        return <span className={'boolean'}>{value.toString()}</span>
    } else if (typeof value === 'number') {
        if (value - Math.floor(value) < 1e-9) {
            return <span className={'int'}>{formatInt(value)}</span>
        } else {
            return <span className={'float'}>{formatInt(value)}</span>
        }
    } else if (typeof value === 'string') {
        return <span className={'string'}>{value}</span>
    } else if (value instanceof Array) {
        let elements = [<span key={'start'} className={'subtle'}>{'['}</span>]

        for (let i = 0; i < value.length; ++i) {
            if (i > 0) {
                elements.push(<span key={`sep_${i}`} className={'subtle'}>{', '}</span>)
            }
            elements.push(<FormattedValue key={i} value={value[i]}/>)
        }

        elements.push(<span key={'end'} className={'subtle'}>{']'}</span>)
        return <span>{elements}</span>
    } else {
        return <span className={'unknown'}>{value}</span>
    }
}

export function scaleValue(value: number, minValue: number, maxValue: number) {
    value = Math.abs(value)
    minValue = Math.abs(minValue)
    maxValue = Math.abs(maxValue)

    return (value - minValue) / (maxValue - minValue)
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

