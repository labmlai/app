export interface CardProps {
    uuid: string
    width: number
}

export interface SummaryCardProps extends CardProps {
    refreshRef: any
}

export interface ViewProps {
    location: any
}

export interface ViewCardProps extends BasicProps, ViewProps {
    headerCard: any
}

export interface BasicProps {
    title: string
    cache: any
}

export interface Analysis {
    card: any
    view: any
    route: string
}
