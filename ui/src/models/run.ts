import {Config, ConfigModel} from "./config";

export interface RunModel {
    run_uuid: string
    name: string
    comment: string
    start_time: number
    is_claimed: boolean
    configs: ConfigModel[]
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

export class Run {
    run_uuid: string
    name: string
    comment: string
    start_time: number
    is_claimed: boolean
    configs: Config[]

    constructor(run: RunModel) {
        this.run_uuid = run.run_uuid
        this.name = run.name
        this.comment = run.comment
        this.start_time = run.start_time
        this.is_claimed = run.is_claimed
        this.configs = []
        for (let c of run.configs) {
            this.configs.push(new Config(c))
        }
    }
}

