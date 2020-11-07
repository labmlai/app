import axios, {AxiosInstance} from 'axios'

import {UserModel} from "./models/user";

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
            return response
        }, (error: any) => {
            if (this.handleError != null) {
                this.handleError(error)
            }

            return Promise.reject(error)
        })
    }

    async get_run(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/run/${run_uuid}`)
    }

    async get_status(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/status/${run_uuid}`)
    }

    async get_tracking(url: string, run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/${url}/${run_uuid}`, {})
    }

    async get_runs(labml_token: string | null): Promise<any> {
        return this.axiosInstance.get(`/runs/${labml_token}`, {})
    }

    async get_user(): Promise<any> {
        return this.axiosInstance.get(`/user`, {})
    }

    async get_preferences(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/preferences/${run_uuid}`, {})
    }

    async sign_in(data: UserModel): Promise<any> {
        return this.axiosInstance.post(`/auth/sign_in`, data)
    }

    async sign_out(): Promise<any> {
        return this.axiosInstance.delete(`/auth/sign_out`)
    }

    async update_preferences(data: object, run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/preferences/${run_uuid}`, data)
    }
}

const NETWORK = new Network()
export default NETWORK