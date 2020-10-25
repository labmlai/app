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
    last_updated_time: number
    run_status: RunStatusModel
}

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    start_time: number
    configs: ConfigModel[]
    preferences: object
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
    last_updated_time: number
    run_status: RunStatus

    constructor(status: StatusModel) {
        this.uuid = status.run_uuid
        this.last_updated_time = status.last_updated_time
        this.run_status = new RunStatus(status.run_status)
    }

    get isRunning() {
        if (this.run_status.status === 'in progress') {
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
    start_time: number
    configs: Config[]
    preferences: any

    constructor(run: RunModel) {
        this.uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.start_time = run.start_time
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
        this.preferences = run.preferences
    }
}

export interface PointValue {
    step: number
    value: number
    smoothed: number
}
