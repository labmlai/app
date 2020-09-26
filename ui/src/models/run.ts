import {Config, ConfigModel} from "./config";

export interface RunStatusModel {
    status: string
    details: string
    time: number
}

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    configs: ConfigModel[]
    start_time: number
    last_updated_time: number
    status: RunStatusModel
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
    configs: Config[]
    start_time: number
    last_updated_time: number
    status: RunStatus

    constructor(run: RunModel) {
        this.uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
        this.start_time = run.start_time
        this.last_updated_time = run.last_updated_time
        this.status = new RunStatus(run.status)
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

export interface PointValue {
    step: number
    value: number
    smoothed: number
}
