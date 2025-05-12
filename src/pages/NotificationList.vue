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
              @click="openConfirmDialog(item)"
            />
          </template>
        </notification-item>
      </template>
    </div>
  </q-page>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="deleteNotification()">
      <template v-slot:message>
        Are you sure you want to remove this notification?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
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
import { useAuthStore } from 'src/stores/auth-store';
import ConfirmRemoveDialog from 'src/components/ConfirmRemoveDialog.vue';
import { ref } from 'vue';

const $q = useQuasar();
const notificationStore = useNotificationStore();
const nodeResourceStore = useNodeResourceStore();
const authStore = useAuthStore();
const router = useRouter();
const notifications = computed(() => notificationStore.getNotifications);
const selectedNotification = ref<Notification | null>(null);
const showRemoveDialog = ref(false);

onMounted(async () => {
  try {
    if (authStore.isAdmin) {
      await notificationStore.fetchNotifications();
    } else {
      await notificationStore.fetchUserOwnedNotifications(authStore.getUserId);
    }
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

function openConfirmDialog(notification: Notification) {
  selectedNotification.value = notification;
  showRemoveDialog.value = true;
}

async function addNotification() {
  await router.push({ name: 'notification', params: { id: 'new' } });
}

async function editNotification(notification: Notification) {
  await router.push({ name: 'notification', params: { id: notification.id } });
}

async function deleteNotification() {
  try {
    await notificationStore.deleteNotification(selectedNotification.value!);
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
