export interface RunStatusModel {
    status: string
    details: string
    time: number
}

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    configs: []
    start: number
    time: number
    status: RunStatusModel
}

export interface SeriesModel {
    name: string
    is_plot: boolean
    step: number[]
    value: number[]
    series: PointValue[]
}

export class RunStatus {
    status: string
    details: string
    time: number

    constructor(status: RunStatusModel) {
        this.status = status.status
        this.details = status.details
        this.time = status.time
    }
}

export class Run {
    uuid: string
    name: string
    comment: string
    configs: []
    start: number
    time: number
    status: RunStatus

    constructor(run: RunModel) {
        this.uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.configs = run.configs
        this.start = run.start
        this.time = run.time
        this.status = new RunStatus(run.status)
    }

    get isRunning() {
        if (this.status.status === 'in progress') {
            let timeDiff = (Date.now() / 1000 - this.time) / 60
            return timeDiff <= 15
        } else {
            return false
        }
    }
}

export interface PointValue {
    step: number
    value: number
    smoothed: number
}
