import NETWORK from "../network"
import {Run, RunModel, SeriesModel} from "../models/run"
import {Status, StatusModel} from "../models/status"
import {RunsList, RunsListModel} from "../models/run_list"
import {Preference, PreferenceModel} from "../models/preferences"
import {User, UserModel} from "../models/user"

const RELOAD_TIMEOUT = 60 * 1000

class BroadcastPromise<T> {
    // Registers a bunch of promises and broadcast to all of them
    private isLoading: boolean
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
            // Load again only if not currently loading;
            // Otherwise resolve/reject will be called when the current loading completes.
            load().then((res: T) => {
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

abstract class CacheObject<T> {
    private data!: T
    protected broadcastPromise = new BroadcastPromise<T>()
    private lastUsed: number

    protected constructor() {
        this.lastUsed = 0
    }

    abstract async load(): Promise<T>

    async get(): Promise<T> {
        if (this.data == null) {
            this.data = await this.load()
        }

        this.lastUsed = new Date().getTime()

        return this.data
    }
}

class RunCache extends CacheObject<Run> {
    private readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

    async load(): Promise<Run> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.get_run(this.uuid)
            return res.data
        })
    }
}

export class StatusCache {
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

export class AnalysisCache {
    private readonly uuid: string
    private readonly url: string
    private statusCache: StatusCache
    private tracking!: SeriesModel[]
    private trackingPromise = new BroadcastPromise<SeriesModel[]>()

    constructor(uuid: string, url: string, statusCache: StatusCache) {
        this.uuid = uuid
        this.statusCache = statusCache
        this.url = url
    }

    private static isReloadTimeout(lastUpdated: number): boolean {
        return (new Date()).getTime() - lastUpdated > RELOAD_TIMEOUT
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

        if (this.tracking == null || (status.isRunning && AnalysisCache.isReloadTimeout(lastUpdated)) || isRefresh) {
            this.tracking = await this.loadTracking()
            this.statusCache.setLastUpdated((new Date()).getTime())
            await this.statusCache.getStatus(true)
        }

        return this.tracking
    }
}

class PreferenceCache {
    private preference!: Preference
    private preferencesPromise = new BroadcastPromise<PreferenceModel>()

    private async loadPreferences(): Promise<PreferenceModel> {
        return this.preferencesPromise.create(async () => {
            let res = await NETWORK.get_preferences()
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
        await NETWORK.update_preferences(preference)

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

    private user: UserCache | null
    private runsList: RunsListCache | null
    private preferences: PreferenceCache | null

    constructor() {
        this.runs = {}
        this.statuses = {}
        this.user = null
        this.runsList = null
        this.preferences = null
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

    getPreference() {
        if (this.preferences == null) {
            this.preferences = new PreferenceCache()
        }

        return this.preferences
    }
}

export default new Cache()
