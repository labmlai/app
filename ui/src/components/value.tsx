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

export function FormattedValue(props: {value: any}) {
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
        let elements = [<span className={'subtle'}>{'['}</span>]

        for(let i = 0; i < value.length; ++i) {
            if (i > 0) {
                elements.push(<span className={'subtle'}>{', '}</span>)
            }
            elements.push(<FormattedValue value={value[i]}/> )
        }

        elements.push(<span className={'subtle'}>{']'}</span>)
        return <span>{elements}</span>
    } else {
        return <span className={'unknown'}>{value}</span>
    }
}
