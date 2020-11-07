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
    analysis: string
    name: string
}