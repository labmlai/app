import {SeriesModel} from "../../models/run"

export interface SeriesProps {
    series: SeriesModel[]
    plotIdx: number[]
    width: number
    onSelect?: (i: number) => void
}

export interface LineChartProps extends SeriesProps {
    chartType?: 'log' | 'normal'
}

export let chartTypes: 'log' | 'normal'
