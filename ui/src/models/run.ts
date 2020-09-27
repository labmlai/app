import {Config, ConfigModel} from "./config";


export interface RunListModel extends RunModel, StatusModel {
}

export interface RunStatusModel {
    status: string
    details: string
    time: number
}

export interface StatusModel {
    run_uuid: string
    start_time: number
    last_updated_time: number
    status: RunStatusModel
}

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    configs: ConfigModel[]
}

export interface SeriesModel {
    name: string
    step: number[]
    value: number[]
    smoothed: number[]
    series: PointValue[]
}

export class RunStatus {
    status: string
    details: string
    time: number

    constructor(runStatus: RunStatusModel) {
        this.status = runStatus.status
        this.details = runStatus.details
        this.time = runStatus.time
    }
}

export class Status {
    uuid: string
    start_time: number
    last_updated_time: number
    status: RunStatus

    constructor(status: StatusModel) {
        this.uuid = status.run_uuid
        this.start_time = status.start_time
        this.last_updated_time = status.last_updated_time
        this.status = new RunStatus(status.status)
    }

    get isRunning() {
        if (this.status.status === 'in progress') {
            let timeDiff = (Date.now() / 1000 - this.last_updated_time) / 60
            return timeDiff <= 15
        } else {
            return false
        }
    }
}

export class Run {
    uuid: string
    name: string
    comment: string
    configs: Config[]

    constructor(run: RunModel) {
        this.uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
    }
}

export interface PointValue {
    step: number
    value: number
    smoothed: number
}
