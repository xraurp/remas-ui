import { defineStore, acceptHMRUpdate } from 'pinia';
import { type User } from 'src/components/db_models';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

interface CustomPayload extends JwtPayload {
  is_admin: boolean;
  user_id: number;
  is_refresh_token: boolean;
}

function getUTCTime() {
  const date = new Date();
  let secNow = Math.floor(date.getTime() / 1000);
  secNow += date.getTimezoneOffset() * 60;
  return secNow;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: '',
    user: <User>{},
  }),
  getters: {
    isRefreshTokenExpired: (state) => {
      if (!state.refreshToken) {
        return true;
      }
      const decodeTokenExpiration = jwtDecode<CustomPayload>(
        state.refreshToken,
      ).exp;
      if (decodeTokenExpiration) {
        return decodeTokenExpiration < getUTCTime();
      }
      return true;
    },
    isAccessTokenExpired: (state) => {
      if (!state.accessToken) {
        return true;
      }
      const decodeTokenExpiration = jwtDecode<CustomPayload>(
        state.accessToken,
      ).exp;
      if (decodeTokenExpiration) {
        return decodeTokenExpiration < getUTCTime();
      }
      return true;
    },
    isAdmin: (state) => {
      if (!state.refreshToken) {
        return false;
      }
      return jwtDecode<CustomPayload>(state.refreshToken).is_admin;
    },
    getUserId: (state) => jwtDecode<CustomPayload>(state.refreshToken).user_id,
    getUserUsername: (state) =>
      jwtDecode<CustomPayload>(state.refreshToken).sub,
    getRefreshTokenExpiration: (state) =>
      jwtDecode<CustomPayload>(state.refreshToken).exp,
    getAccessTokenExpiration: (state) =>
      jwtDecode<CustomPayload>(state.accessToken).exp,
    getUser: (state) => state.user,
    getAccessToken: (state) => state.accessToken,
    getRefreshToken: (state) => state.refreshToken,
  },
  actions: {
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    },
    setUser(user: User) {
      this.user = user;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
