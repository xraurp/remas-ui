import { defineStore, acceptHMRUpdate } from 'pinia';
import type { User, UserWithPassword, Group } from 'src/components/db_models';
import { api } from 'src/boot/axios';
import { getMessageFromError } from 'src/components/aux_functions';

const userBasePath = '/user';
const groupBasePath = '/group';

export const useUserGroupStore = defineStore('userGroupStore', {
  state: () => ({
    users: <User[]>[],
    groups: <Group[]>[],
  }),
  getters: {
    getUsers: (state) => state.users,
    getGroups: (state) => state.groups,
  },
  actions: {
    getUserById(id: number): User | undefined {
      return this.users.find((u) => u.id === id);
    },
    getGroupById(id: number): Group | undefined {
      return this.groups.find((g) => g.id === id);
    },
    async fetchUsers(): Promise<void> {
      let response = null;
      try {
        response = await api.get(userBasePath);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to fetch users!'));
      }
      this.users = response.data;
    },
    async fetchGroups(): Promise<void> {
      let response = null;
      try {
        response = await api.get(groupBasePath);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }

        throw new Error(getMessageFromError(error, 'Failed to fetch groups!'));
      }
      this.groups = response.data;
    },
    async updateUser(user: User): Promise<User> {
      let response = null;
      try {
        response = await api.put(`${userBasePath}`, user);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to update user!'));
      }
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i]?.id === user.id) {
          this.users[i] = response.data;
          break;
        }
      }
      return response.data;
    },
    async updateGroup(group: Group): Promise<Group> {
      let response = null;
      try {
        response = await api.put(`${groupBasePath}`, group);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to update group!'));
      }
      for (let i = 0; i < this.groups.length; i++) {
        if (this.groups[i]?.id === group.id) {
          this.groups[i] = response.data;
          break;
        }
      }
      return response.data;
    },
    async createUser(user: UserWithPassword): Promise<User> {
      let response = null;
      try {
        response = await api.post(userBasePath, user);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to create user!'));
      }
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data.detail);
      }
      this.users.push(response.data);
      return response.data;
    },
    async createGroup(group: Group): Promise<Group> {
      let response = null;
      try {
        response = await api.post(groupBasePath, group);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to create group!'));
      }
      this.groups.push(response.data);
      return response.data;
    },
    async deleteUser(user: User): Promise<void> {
      try {
        await api.delete(`${userBasePath}/${user.id}`);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to delete user!'));
      }
      this.users = this.users.filter((u) => u.id !== user.id);
    },
    async deleteGroup(group: Group): Promise<void> {
      try {
        await api.delete(`${groupBasePath}/${group.id}`);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(getMessageFromError(error, 'Failed to delete group!'));
      }
      this.groups = this.groups.filter((g) => g.id !== group.id);
    },
    async addUserToGroup(user: User, group: Group): Promise<Group> {
      const message = {
        user_id: user.id,
        group_id: group.id,
      };
      let response = null;
      try {
        response = await api.post(`${groupBasePath}/add_user`, message);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(
          getMessageFromError(error, 'Failed to add user to group!'),
        );
      }
      return response.data;
    },
    async changeGroupParent(group: Group, parent: Group): Promise<Group> {
      const message = {
        group_id: group.id,
        parent_id: parent.id,
      };
      let response = null;
      try {
        response = await api.post(`${groupBasePath}/change_parent`, message);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(
          getMessageFromError(error, 'Failed to change group parent!'),
        );
      }
      return response.data;
    },
    async setUserPassword(user: User, password: string): Promise<string> {
      const message = {
        user_id: user.id,
        new_password: password,
      };
      let response = null;
      try {
        response = await api.post('/authentication/set_password', message);
      } catch (error) {
        if (process.env.debug) {
          console.log(error);
        }
        throw new Error(
          getMessageFromError(error, 'Failed to set user password!'),
        );
      }
      return response.data;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserGroupStore, import.meta.hot));
}
