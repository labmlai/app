import NETWORK from "../network";
import {Run, RunModel, SeriesModel, Status, StatusModel} from "../models/run";

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
    private status!: Status
    private metricTracking!: SeriesModel[]
    private modelTracking!: SeriesModel[]
    private runPromise = new BroadcastPromise<RunModel>()
    private metricTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private ModelTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private statusPromise = new BroadcastPromise<StatusModel>()

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

    private async loadStatus(): Promise<StatusModel> {
        return this.statusPromise.create(async () => {
            let res = await NETWORK.get_status(this.uuid)
            return res.data
        })
    }

    private async loadMetricTracking(): Promise<SeriesModel[]> {
        return this.metricTrackingPromise.create(async () => {
            let res = await NETWORK.get_metric_tracking(this.uuid)
            return res.data
        })
    }

    private async loadModelTracking(): Promise<SeriesModel[]> {
        return this.ModelTrackingPromise.create(async () => {
            let res = await NETWORK.get_model_tracking(this.uuid)
            return res.data
        })
    }

    async getRun(): Promise<Run> {
        if (this.run == null) {
            this.run = new Run(await this.loadRun())
        }

        return this.run
    }

    async getStatus(): Promise<Status> {
        if (this.status == null) {
            this.status = new Status(await this.loadStatus())
        }

        return this.status
    }

    private isTrackingTimeOut(): boolean {
        return (new Date()).getTime() - this.lastUpdated > TRACKING_TIMEOUT
    }

    async getMetricTracking(): Promise<SeriesModel[]> {
        await this.getRun()

        if (this.metricTracking == null || this.status.isRunning && this.isTrackingTimeOut()) {
            this.metricTracking = await this.loadMetricTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.metricTracking
    }

    async getModelTracking(): Promise<SeriesModel[]> {
        await this.getRun()

        if (this.modelTracking == null || this.status.isRunning && this.isTrackingTimeOut()) {
            this.modelTracking = await this.loadModelTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.modelTracking
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
