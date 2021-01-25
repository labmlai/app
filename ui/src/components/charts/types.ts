import {SeriesModel} from "../../models/run"

export interface SeriesProps {
    series: SeriesModel[]
    plotIdx: number[]
    width: number
    onSelect?: (i: number) => void
    currentX?: any| null
}

export interface LineChartProps extends SeriesProps {
    chartType?: 'log' | 'normal'
    isMouseMoveAdded?: boolean
}

export let chartTypes: 'log' | 'normal'
