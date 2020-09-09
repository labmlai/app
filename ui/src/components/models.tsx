export interface Status {
    status: string
    time: number
    details: string
}

export interface Run {
    run_uuid: string,
    name: string,
    comment: string,
    start: number,
    time: number,
    status: Status
}
