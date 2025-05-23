<template>
  <div class="q-gutter-md">
    <div class="text-h6">Notifications</div>
    <q-separator />
    <q-btn :label="getButtonLabel()" color="green" @click="onShowList" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="item in entityNotifications">
        <notification-item
          v-if="item?.notification.id"
          :key="item.notification.id"
          :notification="item.notification"
          :group_name="item.group_name"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions v-if="showRemoveButton(item)">
            <q-btn
              flat
              color="negative"
              @click="openConfirmDialog(item)"
              label="Remove"
            />
          </template>
        </notification-item>
      </template>
    </div>
    <q-separator v-if="showUnassignedNotifications" />
    <div
      class="q-pa-md row items-start q-gutter-md"
      v-if="showUnassignedNotifications"
    >
      <template v-for="item in notifications">
        <notification-item
          v-if="item?.id"
          :key="item.id"
          :notification="item"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn
              flat
              color="primary"
              @click="addNotification(item)"
              label="Add"
            />
          </template>
        </notification-item>
      </template>
    </div>
  </div>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="removeNotification()">
      <template v-slot:message>
        Are you sure you want to remove this notification?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { useNotificationStore } from 'src/stores/notification-store';
import type {
  Notification,
  GroupNotifications,
  AssignedNotificaion,
  User,
  Group,
} from '../db_models';
import { computed, onMounted, ref } from 'vue';
import { getMessageFromError } from '../aux_functions';
import { useQuasar } from 'quasar';
import NotificationItem from './NotificationItem.vue';
import ConfirmRemoveDialog from '../ConfirmRemoveDialog.vue';

const props = defineProps<{
  user?: User;
  group?: Group;
  is_profile?: boolean;
}>();

const notificationStore = useNotificationStore();
const $q = useQuasar();
const showUnassignedNotifications = ref(false);
const entityNotifications = ref<AssignedNotificaion[]>([]);
const selectedNotification = ref<AssignedNotificaion>();
const showRemoveDialog = ref(false);

/**
 * Gets notifications for user or group from store
 */
async function getEntityNotifications() {
  let result: GroupNotifications[] = [];
  try {
    if (props.user && props.user.id) {
      result = await notificationStore.getUserNotifications(props.user.id);
    }
    if (props.group && props.group.id) {
      result = await notificationStore.getGroupNotifications(props.group.id);
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch notifications!'),
    });
  }
  if (!result) {
    return [];
  } else {
    const notifications = [];
    for (const g of result) {
      for (const n of g.notifications) {
        notifications.push(<AssignedNotificaion>{
          group_id: g.group_id,
          group_name: g.group_name,
          notification: n,
        });
      }
    }
    return notifications;
  }
}

onMounted(async () => {
  try {
    entityNotifications.value = await getEntityNotifications();
    if (props.is_profile) {
      await notificationStore.fetchUserOwnedNotifications(props.user!.id!);
    } else if (!notificationStore.getNotifications.length) {
      await notificationStore.fetchNotifications();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch notifications!'),
    });
  }
  console.log(entityNotifications.value);
});

// List of notifications assigned to user or group
const notifications = computed(() => {
  if (props.is_profile) {
    return notificationStore.getNotifications
      .filter(
        (n) =>
          !entityNotifications.value.find((en) => en.notification.id === n.id),
      )
      .filter((n) => n.owner_id === props.user?.id);
  }
  return notificationStore.getNotifications.filter(
    (n) => !entityNotifications.value.find((en) => en.notification.id === n.id),
  );
});

/**
 * Checks if a notification is assigned to the current user or group
 * or inherited from parent.
 * @returns {boolean} True if the notification is assigned to the current user or group
 */
function showRemoveButton(notification: AssignedNotificaion) {
  if (props.user && notification.group_id === null) {
    return true;
  } else if (props.group && notification.group_id === props.group.id) {
    return true;
  }
  return false;
}

/**
 * Adds notification to current user
 * @param notification Notification to add
 */
async function addUserNotification(notification: Notification) {
  if (!props.user || !props.user.id) {
    $q.notify({
      type: 'negative',
      message: 'User identification failed!',
    });
    return;
  }
  console.log(notification);
  if (!notification || !notification.id) {
    $q.notify({
      type: 'negative',
      message: 'Failed to add notification!',
    });
    return;
  }
  await notificationStore
    .assignNotificationToUser(notification.id, props.user.id)
    .then(() => {
      entityNotifications.value.push(<AssignedNotificaion>{
        group_id: null,
        group_name: null,
        notification: notification,
      });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(
          error,
          'Failed to assign notification to user!',
        ),
      });
    });
}

/**
 * Adds notification to current group
 * @param notification Notification to add
 */
async function addGroupNotification(notification: Notification) {
  if (!props.group || !props.group.id) {
    $q.notify({
      type: 'negative',
      message: 'Group identification failed!',
    });
    return;
  }
  if (!notification || !notification.id) {
    $q.notify({
      type: 'negative',
      message: 'Failed to add notification!',
    });
    return;
  }
  await notificationStore
    .assignNotificationToGroup(notification.id, props.group.id)
    .then(() => {
      entityNotifications.value.push(<AssignedNotificaion>{
        group_id: props.group?.id,
        group_name: props.group?.name,
        notification: notification,
      });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(
          error,
          'Failed to assign notification to group!',
        ),
      });
    });
}

/**
 * Adds notification to current user or group
 * @param notification Notification to add
 */
async function addNotification(notification: Notification) {
  console.log(notification);
  console.log(props);
  if (props.user && props.user.id) {
    await addUserNotification(notification);
  } else if (props.group && props.group.id) {
    await addGroupNotification(notification);
  } else {
    $q.notify({
      type: 'negative',
      message: 'Failed to add notification!',
    });
  }
}

/**
 * Removes notification from current user
 * @param notification Notification to remove
 */
async function removeUserNotification(
  assignedNotificaion: AssignedNotificaion,
) {
  if (!props.user || !props.user.id) {
    $q.notify({
      type: 'negative',
      message: 'User identification failed!',
    });
    return;
  }
  if (
    !assignedNotificaion.notification ||
    !assignedNotificaion.notification.id
  ) {
    $q.notify({
      type: 'negative',
      message: 'Failed to remove notification!',
    });
    return;
  }
  await notificationStore
    .unassignNotificationFromUser(
      assignedNotificaion.notification.id,
      props.user.id,
    )
    .then(() => {
      entityNotifications.value = entityNotifications.value.filter(
        (en) =>
          en.notification.id !== assignedNotificaion.notification.id ||
          en.group_id !== null,
      );
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(
          error,
          'Failed to unassign notification from user!',
        ),
      });
    });
}

/**
 * Removes notification from current group
 * @param notification Notification to remove
 */
async function removeGroupNotification(
  assignedNotificaion: AssignedNotificaion,
) {
  if (!props.group || !props.group.id) {
    $q.notify({
      type: 'negative',
      message: 'Group identification failed!',
    });
    return;
  }
  if (
    !assignedNotificaion.notification ||
    !assignedNotificaion.notification.id
  ) {
    $q.notify({
      type: 'negative',
      message: 'Failed to remove notification!',
    });
    return;
  }
  await notificationStore
    .unassignNotificationFromGroup(
      assignedNotificaion.notification.id,
      props.group.id,
    )
    .then(() => {
      entityNotifications.value = entityNotifications.value.filter(
        (en) => en.notification.id !== assignedNotificaion.notification.id,
      );
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(
          error,
          'Failed to unassign notification from group!',
        ),
      });
    });
}

function openConfirmDialog(notification: AssignedNotificaion) {
  showRemoveDialog.value = true;
  selectedNotification.value = notification;
}

/**
 * Removes notification from current user or group.
 * Notification to remove is stored in selectedNotification variable.
 */
async function removeNotification() {
  if (!selectedNotification.value) {
    $q.notify({
      type: 'negative',
      message: 'Failed to remove notification!',
    });
    return;
  }
  const notification = selectedNotification.value;
  if (props.user && props.user.id) {
    await removeUserNotification(notification);
  } else if (props.group && props.group.id) {
    await removeGroupNotification(notification);
  } else {
    $q.notify({
      type: 'negative',
      message: 'Failed to remove notification!',
    });
  }
}

/**
 * Toggles list of unassigned notifications
 */
function onShowList() {
  showUnassignedNotifications.value = !showUnassignedNotifications.value;
}

/**
 * Returns label for add notifications button
 */
function getButtonLabel() {
  if (showUnassignedNotifications.value) {
    return 'Done';
  }
  return 'Add notifications';
}
</script>
