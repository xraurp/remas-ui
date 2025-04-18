<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="notificationName"
            label="Notification name"
            :rules="[(val) => !!val || 'Notification name is required!']"
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
          />
          <q-select
            outlined
            v-model="notificationType"
            :options="notificationTypeOptions"
            label="User share statistics"
          />
        </div>
        <div
          class="q-gutter-sm"
          style="padding-bottom: 5px"
          v-if="isGrafanaAlert"
        >
          <q-select
            outlined
            v-model="selectedResource"
            :options="resourceList"
            label="Select resource"
            clearable
            option-label="name"
            :rules="[(val) => !!val || 'Resource is required!']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{
                    scope.opt.description
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip v-for="alias in scope.opt.aliases" :key="alias.id">{{
                    alias.name
                  }}</q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div style="padding-bottom: 5px">
            <div class="row q-gutter-sm">
              <q-input
                outlined
                v-model="defaultAmount"
                autofocus
                type="number"
                label="Default amount"
                class="col"
              />
              <q-select
                outlined
                v-model="selectedUnit"
                :options="unitListOptions"
                label="Unit"
                class="col-3"
                :disable="unitListOptions.length < 2"
              />
            </div>
          </div>
          <div style="padding-bottom: 5px">
            <q-input
              outlined
              v-model="notificationTemplate"
              label="Notification template"
              type="textarea"
            />
          </div>
        </div>
        <div class="q-gutter-sm" style="padding-bottom: 5px" v-else>
          <div class="row">
            <q-input
              outlined
              v-model="timeOffset"
              label="Time offset (in seconds)"
              type="number"
              class="col"
            />
          </div>
          <div class="row">
            <q-input
              outlined
              v-model="notificationTemplate"
              label="Notification template"
              type="textarea"
              class="col"
            />
          </div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Create notification"
            type="submit"
            color="primary"
            class="col"
          />
          <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  getConversionInverse,
  getMessageFromError,
  getNotificationType,
  getUnitList,
  isAlertNotification,
  notificationTypeStrList,
} from '../aux_functions';
import { useQuasar } from 'quasar';
import { useNotificationStore } from 'src/stores/notification-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { type Resource, Unit } from '../db_models';

const router = useRouter();
const notificationStore = useNotificationStore();
const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();

onMounted(async () => {
  try {
    if (!nodeResourceStore.getResources.length) {
      await nodeResourceStore.fetchResources();
    }
    if (!notificationStore.getNotifications.length) {
      await notificationStore.fetchNotifications();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to fetch resources!');
    $q.notify({ type: 'negative', message });
  }
});

const notificationName = ref('');
const description = ref('');
const notificationTypeOptions = notificationTypeStrList;
const notificationType = ref(notificationTypeOptions[0] || '');
const isGrafanaAlert = computed(() =>
  isAlertNotification(getNotificationType(notificationType.value)),
);
// Grafana alert options
const resourceList = ref<Resource[]>(nodeResourceStore.getResources);
const selectedResource = ref<Resource>();
const defaultAmount = ref(0);
const unitListOptions = computed(() =>
  getUnitList(selectedResource.value?.unit || Unit.NONE),
);
const selectedUnit = ref(unitListOptions.value[0] || '');

// time based alert
const timeOffset = ref(0);
const notificationTemplate = ref('');

function onCancel() {
  router.back();
}

async function onSubmit() {
  await notificationStore
    .createNotification({
      name: notificationName.value,
      description: description.value,
      type: getNotificationType(notificationType.value),
      resource_id: selectedResource.value?.id || null,
      default_amount: getConversionInverse(
        defaultAmount.value,
        selectedUnit.value,
        selectedResource.value?.unit,
      ),
      time_offset: timeOffset.value,
      notification_template: notificationTemplate.value,
    })
    .then(async (newNotification) => {
      if (process.env.debug) {
        console.log(newNotification);
      }
      $q.notify({
        type: 'positive',
        message: 'Notification created successfully!',
      });
      await router.replace({
        name: 'notification',
        params: { id: newNotification.id },
      });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(
        error,
        'Failed to create notification!',
      );
      $q.notify({ type: 'negative', message });
    });
}
</script>
