import NETWORK from "../network";
import {Run, RunModel, SeriesModel, Status, StatusModel, RunsList, RunsListModel} from "../models/run";
import {User, UserModel} from "../models/user";

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
    private metricsTracking!: SeriesModel[]
    private gradsTracking!: SeriesModel[]
    private paramsTracking!: SeriesModel[]
    private modulesTracking!: SeriesModel[]
    private timesTracking!: SeriesModel[]
    private runPromise = new BroadcastPromise<RunModel>()
    private metricsTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private gradsTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private paramsTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private modulesTrackingPromise = new BroadcastPromise<SeriesModel[]>()
    private timesTrackingPromise = new BroadcastPromise<SeriesModel[]>()
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

    private async loadMetricsTracking(): Promise<SeriesModel[]> {
        return this.metricsTrackingPromise.create(async () => {
            let res = await NETWORK.get_metrics_tracking(this.uuid)
            return res.data
        })
    }

    private async loadGradsTracking(): Promise<SeriesModel[]> {
        return this.gradsTrackingPromise.create(async () => {
            let res = await NETWORK.get_grads_tracking(this.uuid)
            return res.data
        })
    }

    private async loadParamsTracking(): Promise<SeriesModel[]> {
        return this.paramsTrackingPromise.create(async () => {
            let res = await NETWORK.get_params_tracking(this.uuid)
            return res.data
        })
    }

    private async loadModulesTracking(): Promise<SeriesModel[]> {
        return this.modulesTrackingPromise.create(async () => {
            let res = await NETWORK.get_modules_tracking(this.uuid)
            return res.data
        })
    }

    private async loadTimesTracking(): Promise<SeriesModel[]> {
        return this.timesTrackingPromise.create(async () => {
            let res = await NETWORK.get_times_tracking(this.uuid)
            return res.data
        })
    }

    async getRun(): Promise<Run> {
        if (this.run == null) {
            this.run = new Run(await this.loadRun())
        }

        return this.run
    }

    async setRun(run: Run): Promise<Run> {
        await NETWORK.update_run(run.series_preferences, run.uuid)

        return run
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

    async getMetricsTracking(isRefresh = false): Promise<SeriesModel[]> {
        await this.getStatus()

        if (this.metricsTracking == null || (this.status.isRunning && this.isTrackingTimeOut()) || isRefresh) {
            this.metricsTracking = await this.loadMetricsTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.metricsTracking
    }

    async getGradsTracking(isRefresh = false): Promise<SeriesModel[]> {
        await this.getStatus()

        if (this.gradsTracking == null || (this.status.isRunning && this.isTrackingTimeOut()) || isRefresh) {
            this.gradsTracking = await this.loadGradsTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.gradsTracking
    }

    async getParamsTracking(isRefresh = false): Promise<SeriesModel[]> {
        await this.getStatus()

        if (this.paramsTracking == null || (this.status.isRunning && this.isTrackingTimeOut()) || isRefresh) {
            this.paramsTracking = await this.loadParamsTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.paramsTracking
    }

    async getModulesTracking(isRefresh = false): Promise<SeriesModel[]> {
        await this.getStatus()

        if (this.modulesTracking == null || (this.status.isRunning && this.isTrackingTimeOut()) || isRefresh) {
            this.modulesTracking = await this.loadModulesTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.modulesTracking
    }

    async getTimesTracking(isRefresh = false): Promise<SeriesModel[]> {
        await this.getStatus()

        if (this.timesTracking == null || (this.status.isRunning && this.isTrackingTimeOut()) || isRefresh) {
            this.timesTracking = await this.loadTimesTracking()
            this.lastUpdated = (new Date()).getTime()
            this.status = new Status(await this.loadStatus())
        }

        return this.timesTracking
    }

    public getLastUpdated() {
        return this.lastUpdated
    }
}

class UserCache {
    private user!: User
    private userPromise = new BroadcastPromise<UserModel>()

    private async loadUser(): Promise<UserModel> {
        return this.userPromise.create(async () => {
            let res = await NETWORK.get_user()
            return res.data
        })
    }

    async getUser(): Promise<User> {
        if (this.user == null) {
            this.user = new User(await this.loadUser())
        }

        return this.user
    }
}

class RunsListCache {
    private runsList!: RunsList
    private runsListPromise = new BroadcastPromise<RunsListModel>()

    private async loadRuns(labml_token: string | null): Promise<RunsListModel> {
        return this.runsListPromise.create(async () => {
            let res = await NETWORK.get_runs(labml_token)
            return res.data
        })
    }

    async getRunsList(labml_token: string | null): Promise<RunsList> {
        if (labml_token) {
            return await this.loadRuns(labml_token)
        }

        if (this.runsList == null) {
            this.runsList = await this.loadRuns(null)
        }

        return this.runsList
    }
}

class Cache {
    private readonly runs: { [uuid: string]: RunCache }
    private user: UserCache | null
    private runsList: RunsListCache | null

    constructor() {
        this.runs = {}
        this.user = null
        this.runsList = null
    }

    getRun(uuid: string) {
        if (this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid)
        }

        return this.runs[uuid]
    }

    getUser() {
        if (this.user == null) {
            this.user = new UserCache()
        }

        return this.user
    }

    getRunsList() {
        if (this.runsList == null) {
            this.runsList = new RunsListCache()
        }

        return this.runsList
    }
}

export default new Cache()
