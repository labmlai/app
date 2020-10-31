import {Config, ConfigModel} from "./config";


export interface RunListItemModel {
    run_uuid: string
    run_status: RunStatus
    last_updated_time: number
    name: string
    comment: string
    start_time: number
}

export interface RunsListModel {
    runs: RunListItemModel[]
    labml_token: string
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

export interface IndicatorTypes {
    param: boolean
    module: boolean
    time: boolean
    grad: boolean
    metric: boolean
}

export interface SeriesPreferences {
    metrics: number[]
    params: number[]
    modules: number[]
    times: number[]
    grads: number[]
}

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    start_time: number
    configs: ConfigModel[]
    series_preferences: SeriesPreferences
    indicator_types: IndicatorTypes
}

export interface PointValue {
    step: number
    value: number
    smoothed: number
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
    series_preferences: SeriesPreferences
    indicator_types: IndicatorTypes


    constructor(run: RunModel) {
        this.uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.start_time = run.start_time
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
        this.series_preferences = run.series_preferences
        this.indicator_types = run.indicator_types
    }
}

export class RunListItem {
    run_uuid: string
    run_status: RunStatus
    last_updated_time: number
    name: string
    comment: string
    start_time: number

    constructor(run_list_item: RunListItemModel) {
        this.run_uuid = run_list_item.run_uuid
        this.name = run_list_item.name
        this.comment = run_list_item.comment
        this.start_time = run_list_item.start_time
        this.last_updated_time = run_list_item.last_updated_time
        this.run_status = new RunStatus(run_list_item.run_status)
    }
}

export class RunsList {
    runs: RunListItemModel[]
    labml_token: string

    constructor(runs_list: RunsListModel) {
        this.runs = []
        for (let r of runs_list.runs) {
            this.runs.push(new RunListItem(r))
        }
        this.labml_token = runs_list.labml_token
    }
}
