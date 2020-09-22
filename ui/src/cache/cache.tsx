import axios from "axios";
import NETWORK from "../network";

const TRACKING_TIMEOUT = 60 * 1000

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

class RunCache {
    private uuid: string
    private lastUpdated: number
    private run?: Run
    private tracking?: SeriesModel[]

    constructor(uuid: string) {
        this.uuid = uuid
        this.lastUpdated = 0
    }

    private async loadRun(): Promise<RunModel> {
        return new Promise<RunModel>(((resolve, reject) => {
            NETWORK.get_run(this.uuid)
                .then((res) => {
                    resolve(res.data)
                })
                .catch((err) => {
                    reject(err.message)
                })
        }))
    }

    private async loadTracking(): Promise<SeriesModel[]> {
        return new Promise<SeriesModel[]>(((resolve, reject) => {
            NETWORK.get_tracking(this.uuid)
                .then((res) => {
                    resolve(res.data)
                })
                .catch((err) => {
                    reject(err.message)
                })
        }))
    }

    async getRun(): Promise<Run> {
        if (this.run == null) {
            this.run = new Run(await this.loadRun())
        }
        return this.run
    }

    async getTracking(): Promise<SeriesModel[]> {
        if (this.run == null) {
            throw new Error("Trying to get tracking before run is loaded")
        }

        if (this.tracking == null) {
            this.tracking = await this.loadTracking()
            this.lastUpdated = (new Date()).getTime()
        }

        if (this.run.isRunning) {
            if ((new Date()).getTime() - this.lastUpdated > TRACKING_TIMEOUT) {
                this.tracking = await this.loadTracking()
                this.lastUpdated = (new Date()).getTime()
            }
        }

        return this.tracking
    }
}

class Cache {
    private runs: {[uuid: string]: RunCache}

    constructor() {
        this.runs = {}
    }

    get(uuid: string) {
        if(this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid)
        }

        return this.runs[uuid]
    }
}

export default new Cache()
