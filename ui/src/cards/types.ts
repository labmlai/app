export interface CardProps {
    uuid: string
    width: number
    errorCallback: (message: string) => void
    lastUpdatedCallback: (message: string) => void
}

export interface ViewProps {
    location: any
}

export interface BasicProps {
    tracking_name: "getMetricsTracking" | "getGradsTracking" | "getParamsTracking" | "getModulesTracking" | "getTimesTracking"
    name: string
}