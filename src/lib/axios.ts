import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
});

// Attach v3 API key as query param on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.params = { ...config.params, api_key: import.meta.env.VITE_TMDB_API_KEY };
  return config;
});

// Surface the error message from TMDB instead of a generic axios error
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status_message?: string }>) => {
    const message = error.response?.data?.status_message ?? error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
