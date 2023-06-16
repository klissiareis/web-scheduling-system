import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface IResquestConfig extends AxiosRequestConfig{
    onFailure?: (error: AxiosError) => void;
    onSucess?: (response: AxiosResponse) => void;
}

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3333',
});
let isRefreshing = false;
let failedRequest: Array<IResquestConfig> = [];

interface RequestConfig extends AxiosRequestConfig {
    onFailure?: (error: AxiosError) => void;
    onSucess?: (response: AxiosResponse) => void;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token:semana-hero');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const refreshSubscribers: Array<(token: string) => void> = [];

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | unknown) => {
        const originalRequest = (error as AxiosError).config as RequestConfig;
        if(error instanceof AxiosError && error.response?.status === 401) {
            if(error.response?.data.code === 'token.expired') {
                try {
                    const refresh_token = localStorage.getItem('refresh_token:semana-hero');
                    const response = await api.post('/users/refresh', {
                        refresh_token,
                    });

                    const {token, refresh_token: newToken} = response.data;
                    localStorage.setItem('token:semana-hero', token);
                    localStorage.setItem('refresh_token:semana-hero', newToken);
                    isRefreshing = false;
                    onRefreshed(token);

                    if(originalRequest?.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return axios(originalRequest);
                } catch (error) {
                    failedRequest.forEach((request) => {
                        request.onFailure?.(error as AxiosError);
                    });
                    failedRequest = [];
                }

                return new Promise((resolve, reject) => {
                    failedRequest.push({
                        ...originalRequest,
                        onSucess: (response) => resolve(response),
                        onFailure: (error) => reject(error),
                    });
                });
            }
        // } else {
        //     localStorage.removeItem('token:semana-hero');
        //     localStorage.removeItem('refresh_token:semana-hero');
        //     localStorage.removeItem('user:semana-hero');
        }
        return Promise.reject(error);
    },
);

function onRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
}

export { api };