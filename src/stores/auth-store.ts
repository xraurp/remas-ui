import { defineStore, acceptHMRUpdate } from 'pinia';
import { type User } from 'src/components/db_models';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { api } from 'src/boot/axios';
import { getMessageFromError } from 'src/components/aux_functions';

interface CustomPayload extends JwtPayload {
  is_admin: boolean;
  user_id: number;
  is_refresh_token: boolean;
}

function getUTCTime() {
  const date = new Date();
  const secNow = Math.ceil(date.getTime() / 1000);
  //secNow += date.getTimezoneOffset() * 60;
  return secNow;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: '',
    user: <User>{},
  }),
  getters: {
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
    isRefreshTokenExpired() {
      if (!this.refreshToken) {
        return true;
      }
      const decodeTokenExpiration = jwtDecode<CustomPayload>(
        this.refreshToken,
      ).exp;
      if (decodeTokenExpiration) {
        return decodeTokenExpiration < getUTCTime();
      }
      return true;
    },
    isAccessTokenExpired() {
      if (!this.accessToken) {
        return true;
      }
      const decodeTokenExpiration = jwtDecode<CustomPayload>(
        this.accessToken,
      ).exp;
      if (decodeTokenExpiration) {
        return decodeTokenExpiration < getUTCTime();
      }
      return true;
    },
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    },
    setUser(user: User) {
      this.user = user;
    },
    async fetchUser() {
      let response = null;
      try {
        response = await api.get(`/user/${this.user.id}`);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to fetch user!'));
      }
      this.user = response.data;
    },
    async updateUserPassword(newPassword: string, oldPassword: string) {
      const message = {
        new_password: newPassword,
        old_password: oldPassword,
      };
      try {
        await api.post('/authentication/update_password', message);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(
          getMessageFromError(error, 'Failed to update user password!'),
        );
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
