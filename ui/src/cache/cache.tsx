import NETWORK from "../network";
import {Run, RunModel, SeriesModel} from "../models/run";

const TRACKING_TIMEOUT = 60 * 1000


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
    private readonly runs: { [uuid: string]: RunCache }

    constructor() {
        this.runs = {}
    }

    get(uuid: string) {
        if (this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid)
        }

        return this.runs[uuid]
    }
}

export default new Cache()
