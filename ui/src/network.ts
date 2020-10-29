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

    async get_metrics_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/metrics_track/${run_uuid}`, {})
    }

    async get_grads_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/grads_track/${run_uuid}`, {})
    }

    async get_params_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/params_track/${run_uuid}`, {})
    }

    async get_modules_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/modules_track/${run_uuid}`, {})
    }

    async get_times_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/times_track/${run_uuid}`, {})
    }

    async get_runs(labml_token: string | null): Promise<any> {
        return this.axiosInstance.get(`/runs/${labml_token}`, {})
    }

    async get_user(): Promise<any> {
        return this.axiosInstance.get(`/user`, {})
    }

    async sign_in(data: UserModel): Promise<any> {
        return this.axiosInstance.post(`/auth/sign_in`, data)
    }

    async sign_out(): Promise<any> {
        return this.axiosInstance.delete(`/auth/sign_out`)
    }

    async update_run(data: object, run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/run/${run_uuid}`, data)
    }
}

const NETWORK = new Network()
export default NETWORK