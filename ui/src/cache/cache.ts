import {AnalysisDataModel, Run} from "../models/run"
import {Status} from "../models/status"
import NETWORK from "../network"
import {IsUserLogged, User} from "../models/user"
import {RunListItemModel, RunsList} from '../models/run_list'
import {AnalysisPreference} from "../models/preferences"
import {ComputerListItemModel, ComputersList} from '../models/computer_list'
import {Computer} from '../models/computer';


const RELOAD_TIMEOUT = 60 * 1000

function isReloadTimeout(lastUpdated: number): boolean {
    return (new Date()).getTime() - lastUpdated > RELOAD_TIMEOUT
}

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
    protected data!: T | any
    protected broadcastPromise = new BroadcastPromise<T>()
    private lastUsed: number
    public lastUpdated: number

    constructor() {
        this.lastUsed = 0
        this.lastUpdated = 0
    }

    abstract load(...args: any[]): Promise<T>

    async get(isRefresh = false, ...args: any[]): Promise<T> {
        if (this.data == null || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()
        }

        this.lastUsed = new Date().getTime()

        return this.data
    }

    invalidate_cache(): void {
        this.data = null
    }
}

export class RunsListCache extends CacheObject<RunsList> {
    async load(...args: any[]): Promise<RunsList> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getRuns(args[0])
            return new RunsList(res)
        })
    }

    async get(isRefresh = false, ...args: any[]): Promise<RunsList> {
        if (args && args[0]) {
            return await this.load(args[0])
        }

        if (this.data == null || isRefresh) {
            this.data = await this.load(null)
        }

        return this.data
    }

    async deleteRuns(runUUIDS: Set<string>): Promise<void> {
        let runs: RunListItemModel[] = []
        // Only updating the cache manually, if the cache exists
        if (this.data) {
            let currentRuns = <RunListItemModel[]>this.data.runs
            for (let run of currentRuns) {
                if (!runUUIDS.has(run.run_uuid)) {
                    runs.push(run)
                }
            }

            this.data.runs = runs
        }
        await NETWORK.deleteRuns(Array.from(runUUIDS))
    }
}

export class ComputersListCache extends CacheObject<ComputersList> {
    async load(): Promise<ComputersList> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getComputers()
            return new ComputersList(res)
        })
    }

    async deleteSessions(sessionUUIDS: Set<string>): Promise<void> {
        let computers: ComputerListItemModel[] = []
        // Only updating the cache manually, if the cache exists
        if (this.data) {
            let currentComputers = <ComputerListItemModel[]>this.data.computers
            for (let computer of currentComputers) {
                if (!sessionUUIDS.has(computer.session_uuid)) {
                    computers.push(computer)
                }
            }

            this.data.computers = computers
        }
        await NETWORK.deleteSessions(Array.from(sessionUUIDS))
    }
}

export class RunCache extends CacheObject<Run> {
    private readonly uuid: string
    private statusCache: RunStatusCache

    constructor(uuid: string, statusCache: RunStatusCache) {
        super()
        this.uuid = uuid
        this.statusCache = statusCache
    }

    async load(): Promise<Run> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getRun(this.uuid)
            return new Run(res)
        })
    }

    async get(isRefresh = false): Promise<Run> {
        let status = await this.statusCache.get()

        if (this.data == null || (status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()

            if ((status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
                await this.statusCache.get(true)
            }
        }

        return this.data
    }

    async setRun(run: Run): Promise<void> {
        await NETWORK.setRun(this.uuid, run)
    }
}

export class ComputerCache extends CacheObject<Computer> {
    private readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

    async load(): Promise<Computer> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getComputer(this.uuid)
            return new Computer(res)
        })
    }

    async setComputer(computer: Computer): Promise<void> {
        await NETWORK.setComputer(this.uuid, computer)
    }
}

export abstract class StatusCache extends CacheObject<Status> {
}

export class RunStatusCache extends StatusCache {
    private readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

    async load(): Promise<Status> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getRunStatus(this.uuid)
            return new Status(res)
        })
    }
}

export class ComputerStatusCache extends StatusCache {
    private readonly uuid: string

    constructor(uuid: string) {
        super()
        this.uuid = uuid
    }

    async load(): Promise<Status> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getComputerStatus(this.uuid)
            return new Status(res)
        })
    }
}

export class UserCache extends CacheObject<User> {
    async load(): Promise<User> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getUser()
            return new User(res)
        })
    }

    async setUser(user: User) {
        await NETWORK.setUser(user)
    }
}

export class IsUserLoggedCache extends CacheObject<IsUserLogged> {
    async load(): Promise<IsUserLogged> {
        return this.broadcastPromise.create(async () => {
            let res = await NETWORK.getIsUserLogged()
            return new IsUserLogged(res)
        })
    }

    set userLogged(is_user_logged: boolean) {
        this.data = new IsUserLogged({is_user_logged: is_user_logged})
    }
}

export class AnalysisDataCache extends CacheObject<AnalysisDataModel> {
    private readonly uuid: string
    private readonly url: string
    private statusCache: StatusCache

    constructor(uuid: string, url: string, statusCache: StatusCache) {
        super()
        this.uuid = uuid
        this.statusCache = statusCache
        this.url = url
    }

    async load(): Promise<AnalysisDataModel> {
        return this.broadcastPromise.create(async () => {
            return await NETWORK.getAnalysis(this.url, this.uuid)
        })
    }

    async get(isRefresh = false): Promise<AnalysisDataModel> {
        let status = await this.statusCache.get()

        if (this.data == null || (status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
            this.data = await this.load()
            this.lastUpdated = (new Date()).getTime()

            if ((status.isRunning && isReloadTimeout(this.lastUpdated)) || isRefresh) {
                await this.statusCache.get(true)
            }
        }

        return this.data
    }

    async setAnalysis(data: {}): Promise<void> {
        await NETWORK.setAnalysis(this.url, this.uuid, data)
    }
}

export class AnalysisPreferenceCache extends CacheObject<AnalysisPreference> {
    private readonly uuid: string
    private readonly url: string

    constructor(uuid: string, url: string) {
        super()
        this.uuid = uuid
        this.url = url
    }

    async load(): Promise<AnalysisPreference> {
        return this.broadcastPromise.create(async () => {
            return await NETWORK.getPreferences(this.url, this.uuid)
        })
    }

    async setPreference(preference: AnalysisPreference): Promise<void> {
        await NETWORK.updatePreferences(this.url, this.uuid, preference)
    }
}

class Cache {
    private readonly runs: { [uuid: string]: RunCache }
    private readonly computers: { [uuid: string]: ComputerCache }
    private readonly runStatuses: { [uuid: string]: RunStatusCache }
    private readonly computerStatuses: { [uuid: string]: ComputerStatusCache }

    private user: UserCache | null
    private isUserLogged: IsUserLoggedCache | null
    private runsList: RunsListCache | null
    private computersList: ComputersListCache | null

    constructor() {
        this.runs = {}
        this.computers = {}
        this.runStatuses = {}
        this.computerStatuses = {}
        this.user = null
        this.runsList = null
        this.computersList = null
        this.isUserLogged = null
    }

    getRun(uuid: string) {
        if (this.runs[uuid] == null) {
            this.runs[uuid] = new RunCache(uuid, this.getRunStatus(uuid))
        }

        return this.runs[uuid]
    }

    getComputer(uuid: string) {
        if (this.computers[uuid] == null) {
            this.computers[uuid] = new ComputerCache(uuid)
        }

        return this.computers[uuid]
    }

    getRunsList() {
        if (this.runsList == null) {
            this.runsList = new RunsListCache()
        }

        return this.runsList
    }

    getComputersList() {
        if (this.computersList == null) {
            this.computersList = new ComputersListCache()
        }

        return this.computersList
    }

    getRunStatus(uuid: string) {
        if (this.runStatuses[uuid] == null) {
            this.runStatuses[uuid] = new RunStatusCache(uuid)
        }

        return this.runStatuses[uuid]
    }

    getComputerStatus(uuid: string) {
        if (this.computerStatuses[uuid] == null) {
            this.computerStatuses[uuid] = new ComputerStatusCache(uuid)
        }

        return this.computerStatuses[uuid]
    }

    getUser() {
        if (this.user == null) {
            this.user = new UserCache()
        }

        return this.user
    }

    getIsUserLogged() {
        if (this.isUserLogged == null) {
            this.isUserLogged = new IsUserLoggedCache()
        }

        return this.isUserLogged
    }
}

let CACHE = new Cache()

export default CACHE
