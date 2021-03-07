import Card from "./card"

export interface CardOptions {
    uuid: string
    width: number
}

export interface Analysis {
    card: new (opt: CardOptions) => Card
    viewHandler: any
    route: string
}
