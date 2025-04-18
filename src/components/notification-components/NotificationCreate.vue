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
              <template v-slot:actions>
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
          <div style="padding-bottom: 5px; max-width: 600px">
            <q-input
              outlined
              v-model="notificationTemplate"
              label="Notification template"
              type="textarea"
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
        <div class="row q-gutter-sm" style="max-width: 600px">
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
import ResourceItem from '../resource-components/ResourceItem.vue';

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

function selectResource(resource: Resource) {
  selectedResource.value = resource;
  selectedUnit.value = unitListOptions.value[0] || '';
}

function changeResource() {
  selectedResource.value = undefined;
}

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
