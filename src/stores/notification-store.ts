import { defineStore, acceptHMRUpdate } from 'pinia';
import { apiRequest } from 'src/components/aux_functions';
import type {
  GroupNotifications,
  Notification,
} from 'src/components/db_models';

const baseNotificationPath = '/notification';

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    notifications: <Notification[]>[],
  }),
  getters: {
    getNotifications: (state) => state.notifications,
  },
  actions: {
    async fetchNotifications(): Promise<void> {
      this.notifications = await apiRequest<Notification[], Notification[]>(
        baseNotificationPath,
        'Failed to fetch notifications!',
        'get',
      );
    },
    async createNotification(
      notification: Notification,
    ): Promise<Notification> {
      const data = await apiRequest<Notification, Notification>(
        baseNotificationPath,
        'Failed to create notification!',
        'post',
        notification,
      );
      this.notifications.push(data);
      return data;
    },
    async updateNotification(
      notification: Notification,
    ): Promise<Notification> {
      const data = await apiRequest<Notification, Notification>(
        baseNotificationPath,
        'Failed to update notification!',
        'put',
        notification,
      );
      for (let i = 0; i < this.notifications.length; i++) {
        if (this.notifications[i]?.id === notification.id) {
          this.notifications[i] = data;
          break;
        }
      }
      return data;
    },
    async deleteNotification(notification: Notification): Promise<void> {
      await apiRequest<Notification, Notification>(
        `${baseNotificationPath}/${notification.id}`,
        'Failed to delete notification!',
        'delete',
      );
      this.notifications = this.notifications.filter(
        (n) => n.id !== notification.id,
      );
    },
    async assignNotification(
      notification_id: number,
      user_id: number | null,
      group_id: number | null,
    ): Promise<Notification> {
      if (user_id === null && group_id === null) {
        throw new Error('Nor user nor group specified!');
      }
      const data = await apiRequest<object, Notification>(
        `${baseNotificationPath}/assign`,
        'Failed to assign notification!',
        'post',
        {
          notification_id,
          user_id,
          group_id,
        },
      );
      for (let i = 0; i < this.notifications.length; i++) {
        if (this.notifications[i]?.id === notification_id) {
          this.notifications[i] = data;
          break;
        }
      }
      return data;
    },
    async unassignNotification(
      notification_id: number,
      user_id: number | null,
      group_id: number | null,
    ): Promise<Notification> {
      if (user_id === null && group_id === null) {
        throw new Error('Nor user nor group specified!');
      }
      const data = await apiRequest<object, Notification>(
        `${baseNotificationPath}/unassign`,
        'Failed to unassign notification!',
        'post',
        {
          notification_id,
          user_id,
          group_id,
        },
      );
      for (let i = 0; i < this.notifications.length; i++) {
        if (this.notifications[i]?.id === notification_id) {
          this.notifications[i] = data;
          break;
        }
      }
      return data;
    },
    async assignNotificationToGroup(
      notification_id: number,
      group_id: number,
    ): Promise<Notification> {
      return this.assignNotification(notification_id, null, group_id);
    },
    async unassignNotificationFromGroup(
      notification_id: number,
      group_id: number,
    ): Promise<Notification> {
      return this.unassignNotification(notification_id, null, group_id);
    },
    async assignNotificationToUser(
      notification_id: number,
      user_id: number,
    ): Promise<Notification> {
      return this.assignNotification(notification_id, user_id, null);
    },
    async unassignNotificationFromUser(
      notification_id: number,
      user_id: number,
    ): Promise<Notification> {
      return this.unassignNotification(notification_id, user_id, null);
    },
    /**
     * Fetches notifications for a specific user including notifications
     * from group to which the user belongs and its parent groups.
     */
    async getUserNotifications(user_id: number): Promise<GroupNotifications[]> {
      return await apiRequest<GroupNotifications[], GroupNotifications[]>(
        `${baseNotificationPath}/user/${user_id}`,
        'Failed to get user notifications!',
        'get',
      );
    },
    /**
     * Fetches notifications for a specific group including notifications
     * from parent groups.
     */
    async getGroupNotifications(
      group_id: number,
    ): Promise<GroupNotifications[]> {
      return await apiRequest<GroupNotifications[], GroupNotifications[]>(
        `${baseNotificationPath}/group/${group_id}`,
        'Failed to get group notifications!',
        'get',
      );
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useNotificationStore, import.meta.hot),
  );
}
