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

export interface BasicProps {
    title: string
    cache: any
}
