import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/auth-store';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: process.env.baseURL || 'http://localhost:8000',
});

export default defineBoot(({ app }) => {
  const authStore = useAuthStore();
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  api.interceptors.request.use(
    function (config) {
      // Skip adding token to authentication endpoints
      if (config.url === '/authentication/token') {
        return config;
      }
      if (config.url === '/authentication/refresh') {
        return config;
      }

      // Check if user is logged in
      const refreshToken = authStore.getRefreshToken;
      if (!refreshToken) {
        return Promise.reject(new Error('Login to continue!'));
      }
      if (authStore.isRefreshTokenExpired) {
        return Promise.reject(new Error('Login has expired!'));
      }

      let accessToken = authStore.getAccessToken;
      // Refresh access token if expired
      if (!accessToken || authStore.isAccessTokenExpired) {
        api
          .post('/authentication/refresh', null, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          })
          .then((response) => {
            if (process.env.debug) {
              console.log(response);
            }
            authStore.setTokens(
              response.data.access_token,
              response.data.refresh_token,
            );
            accessToken = response.data.access_token;
          })
          .catch((error) => {
            if (process.env.debug) {
              console.log(error);
            }
            return Promise.reject(new Error('Login has expired!'));
          });
      }

      // Add token to request
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    function (error: Error) {
      return Promise.reject(error);
    },
  );
});

export { api };
