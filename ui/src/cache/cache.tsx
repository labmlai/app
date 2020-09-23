import NETWORK from "../network";
import {Run, RunModel, SeriesModel} from "../models/run";

const TRACKING_TIMEOUT = 60 * 1000

class BroadcastPromise<T> {
    private isLoading: boolean;
    private resolvers: any[]
    private rejectors: any[]

    constructor() {
        this.isLoading = false
        this.resolvers = []
        this.rejectors = []
    }

    private add(resolve: (value: T) => void, reject: (err: any) => void) {
        this.resolvers.push(resolve)
        this.rejectors.push(reject)
    }

    create(load: () => Promise<T>): Promise<T> {
        let promise = new Promise<T>((resolve, reject) => {
            this.add(resolve, reject)
        })

        if (!this.isLoading) {
            this.isLoading = true
            load().then((res) => {
                this.resolve(res)
            }).catch((err) => {
                this.reject(err)
            })
        }

        return promise
    }

    private resolve(value: T) {
        this.isLoading = false
        let resolvers = this.resolvers
        this.resolvers = []
        this.rejectors = []

        for (let r of resolvers) {
            r(value)
        }
    }

    private reject(err: any) {
        this.isLoading = false
        let rejectors = this.rejectors
        this.resolvers = []
        this.rejectors = []

        for (let r of rejectors) {
            r(err)
        }
    }
}

class RunCache {
    private uuid: string
    private lastUpdated: number
    private run!: Run
    private tracking!: SeriesModel[]
    private runPromise = new BroadcastPromise<RunModel>()
    private trackingPromise = new BroadcastPromise<SeriesModel[]>()

    constructor(uuid: string) {
        this.uuid = uuid
        this.lastUpdated = 0
    }

    private async loadRun(): Promise<RunModel> {
        return this.runPromise.create(async () => {
            let res = await NETWORK.get_run(this.uuid)
            return res.data
        })
    }

    private async loadTracking(): Promise<SeriesModel[]> {
        return this.trackingPromise.create(async () => {
            let res = await NETWORK.get_tracking(this.uuid)
            return res.data
        })
    }

    async getRun(): Promise<Run> {
        if (this.run == null) {
            this.run = new Run(await this.loadRun())
        }

        return this.run
    }

    async getTracking(): Promise<SeriesModel[]> {
        await this.getRun()

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
