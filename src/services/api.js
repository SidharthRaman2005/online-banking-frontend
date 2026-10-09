import axios from 'axios';

export const TOKEN_KEY = 'obs_token';
export const USER_KEY = 'obs_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

/** Set by AuthContext so a 401 can clear state through the app, not just localStorage. */
let onUnauthorized = null;
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  // Unwrap the { success, message, data } envelope once, here, so no component ever sees it.
  (response) => response.data?.data ?? response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: 'Cannot reach the server. Is the backend running?',
        errorCode: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // An expired or tampered token: drop the session rather than leaving a half-signed-in UI.
    if (status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      onUnauthorized?.();
    }

    return Promise.reject({
      message: data?.message ?? 'Something went wrong. Please try again.',
      errorCode: data?.errorCode ?? 'UNKNOWN',
      errors: data?.errors ?? null,
      status,
    });
  },
);

export default api;
