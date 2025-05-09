import { defineStore, acceptHMRUpdate } from 'pinia';
import { apiRequest } from 'src/components/aux_functions';
import type { Limit } from 'src/components/db_models';

const limitBasePath = '/limit';

export const useLimitStore = defineStore('limitStore', {
  state: () => ({
    limits: <Limit[]>[],
  }),
  getters: {
    getLimits: (state) => state.limits,
  },
  actions: {
    async fetchLimits(): Promise<void> {
      this.limits = await apiRequest<Limit[], Limit[]>(
        limitBasePath,
        'Failed to fetch limits!',
        'get',
      );
    },
    async createLimit(limit: Limit): Promise<Limit> {
      const data = await apiRequest<Limit, Limit>(
        limitBasePath,
        'Failed to add limit!',
        'post',
        limit,
      );
      this.limits.push(data);
      return data;
    },
    async updateLimit(limit: Limit): Promise<Limit> {
      const data = await apiRequest<Limit, Limit>(
        limitBasePath,
        'Failed to update limit!',
        'put',
        limit,
      );
      for (let i = 0; i < this.limits.length; i++) {
        if (this.limits[i]?.id === limit.id) {
          this.limits[i] = data;
          break;
        }
      }
      return data;
    },
    async deleteLimit(limit: Limit): Promise<void> {
      await apiRequest<void, void>(
        `${limitBasePath}/${limit.id}`,
        'Failed to delete limit!',
        'delete',
      );
      for (let i = 0; i < this.limits.length; i++) {
        if (this.limits[i]?.id === limit.id) {
          this.limits.splice(i, 1);
          break;
        }
      }
    },
    async getAllGroupLimits(group_id: number): Promise<Limit[]> {
      return await apiRequest<Limit[], Limit[]>(
        `${limitBasePath}/group_all/${group_id}`,
        'Failed to get group limits!',
        'get',
      );
    },
    async getAllUserLimits(user_id: number): Promise<Limit[]> {
      return await apiRequest<Limit[], Limit[]>(
        `${limitBasePath}/user_all/${user_id}`,
        'Failed to get user limits!',
        'get',
      );
    },
    logout() {
      this.limits = [];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLimitStore, import.meta.hot));
}
