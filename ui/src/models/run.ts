import {Config, ConfigModel} from "./config"

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    note: string
    start_time: number
    is_claimed: boolean
    configs: ConfigModel[]
    stdout: string
    logger: string
    stderr: string
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
    mean: number
    series: PointValue[]
}

export interface InsightModel {
    message: string
    type: string
    time: number
}

export interface SeriesSummaryModel {
    name: string
    mean: number
}

export interface SeriesDataModel {
    series: SeriesModel[]
    insights: InsightModel[]
    summary: SeriesSummaryModel[]
}

export class Run {
    run_uuid: string
    name: string
    comment: string
    note: string
    start_time: number
    is_claimed: boolean
    configs: Config[]
    stdout: string
    logger: string
    stderr: string

    constructor(run: RunModel) {
        this.run_uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.note = run.note
        this.start_time = run.start_time
        this.is_claimed = run.is_claimed
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
        this.stdout = run.stdout
        this.logger = run.logger
        this.stderr = run.stderr
    }
}

