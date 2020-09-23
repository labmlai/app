import axios, {AxiosResponse} from 'axios';

const axiosInstance: any = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    withCredentials: true
})

axiosInstance.interceptors.response.use((response: AxiosResponse) => {
    return response
}, async function (error: any) {
    if (error.response.status === 403) {

    }
    return Promise.reject(error)
});


class NETWORK {
    static async get_run(run_uuid: string): Promise<any> {
        return axiosInstance.get(`/run/${run_uuid}`)
    }

    static async get_tracking(run_uuid: string): Promise<any> {
        return axiosInstance.post(`/track/${run_uuid}`, {})
    }

    static async get_runs(labml_token: string): Promise<any> {
        return axiosInstance.get(`/runs/${labml_token}`,)
    }

    static async auth(): Promise<any> {
        return axiosInstance.get(`/auth`,)
    }

    static async google_sign_in(token: string): Promise<any> {
        const options = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}

        return axiosInstance.post(`/auth/google/sign_in`, {'token': token})
    }
}

export default NETWORK
