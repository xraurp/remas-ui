<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px; max-width: 600px">
          <q-input
            outlined
            v-model="notificationName"
            label="Notification name"
            :rules="[(val) => !!val || 'Notification name is required!']"
            :disable="readOnly"
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
            :disable="readOnly"
          />
          <q-select
            outlined
            v-model="notificationType"
            :options="notificationTypeOptions"
            label="User share statistics"
            :disable="readOnly"
          />
        </div>
        <div
          class="q-gutter-sm"
          style="padding-bottom: 5px"
          v-if="isGrafanaAlert"
        >
          <div v-if="!selectedResource">
            <div class="text-h6">Select resource</div>

            <q-separator />
            <div class="q-pa-md row items-start q-gutter-md">
              <template v-for="resource in resourceList">
                <ResourceItem
                  v-if="resource.id"
                  :key="resource.id"
                  :resource="resource"
                  style="min-height: 200px; min-width: 400px"
                >
                  <template v-slot:actions>
                    <q-btn
                      flat
                      color="primary"
                      label="Select"
                      @click="selectResource(resource)"
                    />
                  </template>
                </ResourceItem>
              </template>
            </div>
          </div>
          <div class="row q-gutter-md q-pa-md" v-else>
            <ResourceItem
              v-if="selectedResource.id"
              :key="selectedResource.id"
              :resource="selectedResource"
              style="min-height: 200px; min-width: 400px"
            >
              <template v-slot:actions v-if="!readOnly">
                <q-btn
                  flat
                  color="primary"
                  label="Change resource"
                  @click="changeResource()"
                />
              </template>
            </ResourceItem>
          </div>
          <div style="padding-bottom: 5px; max-width: 600px">
            <div class="row q-gutter-sm">
              <q-input
                outlined
                v-model="defaultAmount"
                autofocus
                type="number"
                label="Default amount"
                class="col"
                :disable="readOnly"
              />
              <q-select
                outlined
                v-model="selectedUnit"
                :options="unitListOptions"
                label="Unit"
                class="col-3"
                :disable="unitListOptions.length < 2 || readOnly"
              />
            </div>
          </div>
          <div style="padding-bottom: 5px; max-width: 600px">
            <q-input
              outlined
              v-model="notificationTemplate"
              label="Grafana notification template in JSON format"
              type="textarea"
              :disable="readOnly"
              :rules="[(val) => !!val || 'Notification template is required!']"
            />
          </div>
        </div>
        <div
          class="q-gutter-sm"
          style="padding-bottom: 5px; max-width: 600px"
          v-else
        >
          <div class="row">
            <q-input
              outlined
              v-model="timeOffset"
              label="Time offset (in seconds)"
              type="number"
              class="col"
              :disable="readOnly"
            />
          </div>
          <div class="row">
            <q-input
              outlined
              v-model="notificationTemplate"
              label="Notification template"
              type="textarea"
              class="col"
              :disable="readOnly"
              :rules="[(val) => !!val || 'Notification template is required!']"
            />
          </div>
        </div>
        <div class="row q-gutter-sm" style="max-width: 600px" v-if="!readOnly">
          <q-btn
            label="Update notification"
            type="submit"
            color="primary"
            class="col"
          />
          <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
        </div>
        <div class="row q-gutter-sm" v-if="readOnly">
          <q-btn label="Edit" color="primary" class="col" @click="onEdit" />
          <div class="col"></div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  getConversion,
  getConversionInverse,
  getMessageFromError,
  getNotificationType,
  getNotificationTypeStr,
  getUnitList,
  isAlertNotification,
  notificationTypeStrList,
} from '../aux_functions';
import { useQuasar } from 'quasar';
import { useNotificationStore } from 'src/stores/notification-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { NotificationType, type Resource, Unit } from '../db_models';
import ResourceItem from '../resource-components/ResourceItem.vue';

const props = defineProps<{
  notification_id: number;
}>();

const router = useRouter();
const notificationStore = useNotificationStore();
const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();
const readOnly = ref(true);

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

let notification = notificationStore.getNotifications.find(
  (n) => n.id === props.notification_id,
);

if (!notification) {
  $q.notify({ type: 'negative', message: 'Notification not found!' });
  router.back();
}

// Values are set in resetEditValues
const notificationName = ref('');
const description = ref('');
const notificationTypeOptions = notificationTypeStrList;
const notificationType = ref('');
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

function resetEditValues() {
  notificationName.value = notification?.name || '';
  description.value = notification?.description || '';
  notificationType.value = getNotificationTypeStr(
    notification?.type || NotificationType.other,
  );
  selectedResource.value = resourceList.value.find(
    (r) => r.id === notification?.resource_id,
  );
  const { amount, unit_str } = getConversion(
    notification?.default_amount || 0,
    selectedResource.value?.unit || Unit.NONE,
  );
  defaultAmount.value = amount || 0;
  selectedUnit.value = unit_str || unitListOptions.value[0] || '';
  timeOffset.value = notification?.time_offset || 0;
  notificationTemplate.value = notification?.notification_template || '';
}

resetEditValues();

function compareEdit() {
  let cmp = notificationName.value === notification?.name;
  cmp = cmp && description.value === notification?.description;
  cmp =
    cmp &&
    notificationType.value ===
      getNotificationTypeStr(notification?.type || NotificationType.other);
  cmp =
    cmp &&
    getConversionInverse(
      defaultAmount.value,
      selectedUnit.value,
      selectedResource.value?.unit,
    ) === notification?.default_amount;
  cmp = cmp && timeOffset.value === notification?.time_offset;
  cmp =
    cmp && notificationTemplate.value === notification?.notification_template;
  cmp = cmp && selectedResource.value?.id === notification?.resource_id;
  return cmp;
}

function selectResource(resource: Resource) {
  selectedResource.value = resource;
  selectedUnit.value = unitListOptions.value[0] || '';
}

function changeResource() {
  selectedResource.value = undefined;
}

function onCancel() {
  readOnly.value = true;
  resetEditValues();
}

function onEdit() {
  readOnly.value = false;
}

async function onSubmit() {
  if (compareEdit()) {
    $q.notify({
      type: 'info',
      color: 'primary',
      message: 'No changes detected',
    });
    readOnly.value = true;
    return;
  }
  if (isGrafanaAlert.value && !selectedResource.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a resource',
    });
    return;
  }
  await notificationStore
    .updateNotification({
      id: props.notification_id,
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
    .then((newNotification) => {
      if (process.env.debug) {
        console.log(newNotification);
      }
      $q.notify({
        type: 'positive',
        message: 'Notification updated successfully!',
      });
      notification = newNotification;
      readOnly.value = true;
      resetEditValues();
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
