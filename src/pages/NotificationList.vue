<template>
  <q-page padding>
    <div class="text-h3">Notifications</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add notification" @click="addNotification" />
    <div class="q-pa-md row items-start q-gutter-md">
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
              label="Edit"
              @click="editNotification(item)"
            />
            <q-btn
              flat
              color="negative"
              label="Delete"
              @click="deleteNotification(item)"
            />
          </template>
        </notification-item>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { useNotificationStore } from 'src/stores/notification-store';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { type Notification } from 'src/components/db_models';
import NotificationItem from 'src/components/notification-components/NotificationItem.vue';
import { useNodeResourceStore } from 'src/stores/node-resource-store';

const $q = useQuasar();
const notificationResourceStore = useNotificationStore();
const nodeResourceStore = useNodeResourceStore();
const router = useRouter();
const notifications = computed(
  () => notificationResourceStore.getNotifications,
);

onMounted(async () => {
  try {
    await notificationResourceStore.fetchNotifications();
    if (!nodeResourceStore.getResources.length) {
      await nodeResourceStore.fetchResources();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch data from server!'),
    });
  }
});

async function addNotification() {
  await router.push({ name: 'notification', params: { id: 'new' } });
}

async function editNotification(notification: Notification) {
  await router.push({ name: 'notification', params: { id: notification.id } });
}

async function deleteNotification(notification: Notification) {
  try {
    await notificationResourceStore.deleteNotification(notification);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete notification!'),
    });
  }
}
</script>
