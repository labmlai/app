export interface CardProps {
    uuid: string
    width: number
}

export interface SeriesCardProps extends CardProps {
    refreshRef: any
}

export interface ViewProps {
    location: any
}

let ANALYSES_INDICES: 'metrics' | 'gradients' | 'parameters' | 'outputs' | 'timeTracking'
export {ANALYSES_INDICES}

export interface BasicProps {
    analysisName: string
    analysisIndex: typeof ANALYSES_INDICES
}
