export interface CardProps {
    uuid: string
    width: number
}

export interface SeriesCardProps extends CardProps {
    refreshRef: any
}

export interface ViewProps {
    location: any
    series_preference: "metrics" | "params" | "modules" | "times" | "grads"
}

export interface BasicProps {
    tracking_name: "getMetricsTracking" | "getGradsTracking" | "getParamsTracking" | "getModulesTracking" | "getTimesTracking"
    name: string
}