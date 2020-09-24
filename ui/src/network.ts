import axios from 'axios'

class NETWORK {
    static axiosInstance: any = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    withCredentials: true
})


    static async get_run(run_uuid: string): Promise<any> {
        return this.axiosInstance.get(`/run/${run_uuid}`)
    }

    static async get_tracking(run_uuid: string): Promise<any> {
        return this.axiosInstance.post(`/track/${run_uuid}`, {})
    }

    static async get_runs(labml_token: string): Promise<any> {
        return this.axiosInstance.get(`/runs/${labml_token}`,)
    }

    static async auth(): Promise<any> {
        return this.axiosInstance.get(`/auth`,)
    }

    static async google_sign_in(token: string): Promise<any> {
        const options = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}

        return this.axiosInstance.post(`/auth/google/sign_in`, {'token': token})
    }
}

export default NETWORK
