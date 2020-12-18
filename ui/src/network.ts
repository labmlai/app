import axios, {AxiosInstance} from 'axios'

import {UserModel} from "./models/user"
import CACHE from "./cache/cache"

interface MetaProps {
    is_run_added: boolean
}

function process_meta_data(meta: MetaProps) {
    if (meta && meta.is_run_added) {
        const runListCache = CACHE.getRunsList()
        runListCache.invalidate_cache()
    }
}

class Network {
    axiosInstance: AxiosInstance
    handleError: Function | null

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.REACT_APP_SERVER_URL,
            withCredentials: true
        })

        this.handleError = null

        this.axiosInstance.interceptors.response.use((response: any) => {
            let data = response.data

            process_meta_data(data.meta)

            return data.data
        }, (error: any) => {
            if (this.handleError != null) {
                this.handleError(error)
            }

            return Promise.reject(error)
        })
    }

    async getRun(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/run/${run_uuid}`)
    }

    async getComputer(computer_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/computer/${computer_uuid}`)
    }

    async getRunStatus(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/run/status/${run_uuid}`)
    }

    async getComputerStatus(computer_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/computer/status/${computer_uuid}`)
    }

    async getAnalysis(url: string, run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/${url}/${run_uuid}`, {})
    }

    async getPreferences(url: string, run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/${url}/preferences/${run_uuid}`, {})
    }

    async updatePreferences(url: string, run_uuid: string, data: object): Promise<any> {
        return this.axiosInstance.post(`/${url}/preferences/${run_uuid}`, data)
    }

    async getRuns(labml_token: string | null): Promise<any> {
        return this.axiosInstance.get(`/runs/${labml_token}`, {})
    }

    async getComputers(): Promise<any> {
        return this.axiosInstance.get(`/computers/${null}`, {})
    }

    async deleteRuns(runUUIDS: string[]): Promise<any> {
        return this.axiosInstance.put(`/runs`, {'run_uuids': runUUIDS})
    }

    async getUser(): Promise<any> {
        return this.axiosInstance.get(`/user`, {})
    }

    async signIn(data: UserModel): Promise<any> {
        return this.axiosInstance.post(`/auth/sign_in`, data)
    }

    async signOut(): Promise<any> {
        return this.axiosInstance.delete(`/auth/sign_out`)
    }

    async getIsUserLogged(): Promise<any> {
        return this.axiosInstance.get(`/auth/is_logged`)
    }

}

const NETWORK = new Network()
export default NETWORK