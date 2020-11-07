import NETWORK from "../network";
import {
    Run,
    RunModel,
    SeriesModel,
    Status,
    StatusModel,
    RunsList,
    RunsListModel,
    Preference,
    PreferenceModel
} from "../models/run";
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
    private readonly uuid: string
    private run!: Run
    private runPromise = new BroadcastPromise<RunModel>()

    constructor(uuid: string) {
        this.uuid = uuid
    }

    private async loadRun(): Promise<RunModel> {
        return this.runPromise.create(async () => {
            let res = await NETWORK.get_run(this.uuid)
            return res.data
        })
    }

    async getRun(): Promise<Run> {
        if (this.run == null) {
            this.run = new Run(await this.loadRun())
        }

        return this.run
    }
}

class StatusCache {
    private readonly uuid: string
    private lastUpdated: number
    private status!: Status
    private statusPromise = new BroadcastPromise<StatusModel>()

    constructor(uuid: string) {
        this.uuid = uuid
        this.lastUpdated = 0
    }

    private async loadStatus(): Promise<StatusModel> {
        return this.statusPromise.create(async () => {
            let res = await NETWORK.get_status(this.uuid)
            return res.data
        })
    }

    async getStatus(isRefresh = false): Promise<Status> {
        if (this.status == null || isRefresh) {
            this.status = new Status(await this.loadStatus())
        }

        return this.status
    }

    public getLastUpdated() {
        return this.lastUpdated
    }

    public setLastUpdated(lastUpdated: number) {
        this.lastUpdated = lastUpdated

        return lastUpdated
    }
}

class AnalysisCache {
    private readonly uuid: string
    private readonly url: string
    private statusCache: StatusCache
    private tracking!: SeriesModel[]
    private trackingPromise = new BroadcastPromise<SeriesModel[]>()

    constructor(uuid: string, url: string, statusCache: StatusCache) {
        this.uuid = uuid
        this.url = url
        this.statusCache = statusCache
    }


    private static isTrackingTimeOut(lastUpdated: number): boolean {
        return (new Date()).getTime() - lastUpdated > TRACKING_TIMEOUT
    }

    private async loadTracking(): Promise<SeriesModel[]> {
        return this.trackingPromise.create(async () => {
            let res = await NETWORK.get_tracking(this.url, this.uuid)
            return res.data
        })
    }

    async getTracking(isRefresh = false): Promise<SeriesModel[]> {
        let status = await this.statusCache.getStatus()
        let lastUpdated = this.statusCache.getLastUpdated()

        if (this.tracking == null || (status.isRunning && AnalysisCache.isTrackingTimeOut(lastUpdated)) || isRefresh) {
            this.tracking = await this.loadTracking()
            this.statusCache.setLastUpdated((new Date()).getTime())
            await this.statusCache.getStatus(true)
        }

        return this.tracking
    }
}

class MetricAnalysisCache extends AnalysisCache {

}

class GradientAnalysisCache extends AnalysisCache {

}

class ParameterAnalysisCache extends AnalysisCache {

}

class OutputAnalysisCache extends AnalysisCache {

}

class TimeTrackingAnalysisCache extends AnalysisCache {

}


class PreferenceCache {
    private readonly uuid: string
    private preference!: Preference
    private preferencesPromise = new BroadcastPromise<PreferenceModel>()

    constructor(uuid: string) {
        this.uuid = uuid
    }

    private async loadPreferences(): Promise<PreferenceModel> {
        return this.preferencesPromise.create(async () => {
            let res = await NETWORK.get_preferences(this.uuid)
            return res.data
        })
    }

    async getPreference(): Promise<Preference> {
        if (this.preference == null) {
            this.preference = new Preference(await this.loadPreferences())
        }

        return this.preference
    }

    async setPreference(preference: Preference): Promise<Preference> {
        await NETWORK.update_preferences(preference.series_preferences, this.uuid)

        return this.preference
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
    private readonly statuses: { [uuid: string]: StatusCache }
    private readonly preferences: { [uuid: string]: PreferenceCache }
    private readonly metrics: { [uuid: string]: MetricAnalysisCache }
    private readonly gradients: { [uuid: string]: GradientAnalysisCache }
    private readonly parameters: { [uuid: string]: ParameterAnalysisCache }
    private readonly outputs: { [uuid: string]: OutputAnalysisCache }
    private readonly timeTracking: { [uuid: string]: TimeTrackingAnalysisCache }
    private user: UserCache | null
    private runsList: RunsListCache | null

    constructor() {
        this.runs = {}
        this.statuses = {}
        this.preferences = {}
        this.metrics = {}
        this.gradients = {}
        this.parameters = {}
        this.outputs = {}
        this.timeTracking = {}
        this.user = null
        this.runsList = null
    }

    getRun(uuid: string) {
        if (this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid)
        }

        return this.runs[uuid]
    }

    getStatus(uuid: string) {
        if (this.statuses[uuid] == null) {
            this.statuses[uuid] = new StatusCache(uuid)
        }

        return this.statuses[uuid]
    }

    getPreference(uuid: string) {
        if (this.preferences[uuid] == null) {
            this.preferences[uuid] = new PreferenceCache(uuid)
        }

        return this.preferences[uuid]
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

    getTracking(analysis: string, uuid: string) {
        if (analysis === 'times') {
            return this.getTimeTracking(uuid)
        } else if (analysis === 'grads') {
            return this.getGradients(uuid)
        } else if (analysis === 'params') {
            return this.getParameters(uuid)
        } else if (analysis === 'modules') {
            return this.getOutputs(uuid)
        } else {
            return this.getMetrics(uuid)
        }
    }

    private getMetrics(uuid: string) {
        if (this.metrics[uuid] == null) {
            this.metrics[uuid] = new MetricAnalysisCache(uuid, 'metrics_track', this.getStatus(uuid))
        }

        return this.metrics[uuid]
    }

    private getGradients(uuid: string) {
        if (this.gradients[uuid] == null) {
            this.gradients[uuid] = new GradientAnalysisCache(uuid, 'grads_track', this.getStatus(uuid))
        }

        return this.gradients[uuid]
    }

    private getParameters(uuid: string) {
        if (this.parameters[uuid] == null) {
            this.parameters[uuid] = new ParameterAnalysisCache(uuid, 'params_track', this.getStatus(uuid))
        }

        return this.parameters[uuid]
    }

    private getOutputs(uuid: string) {
        if (this.outputs[uuid] == null) {
            this.outputs[uuid] = new OutputAnalysisCache(uuid, 'modules_track', this.getStatus(uuid))
        }

        return this.outputs[uuid]
    }

    private getTimeTracking(uuid: string) {
        if (this.timeTracking[uuid] == null) {
            this.timeTracking[uuid] = new TimeTrackingAnalysisCache(uuid, 'times_track', this.getStatus(uuid))
        }

        return this.timeTracking[uuid]
    }
}

export default new Cache()
