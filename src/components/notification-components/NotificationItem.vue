<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.notification.name }}</div>
      <q-separator />
      <div class="row">
        <div class="col">Type:</div>
        <div class="col">
          {{ getNotificationTypeStr(props.notification.type) }}
        </div>
      </div>
      <div class="row" v-if="props.notification.resource">
        <div class="col">Resource:</div>
        <div class="col">
          {{ props.notification.resource.name }}
        </div>
      </div>
      <q-separator v-if="props.notification.description" />
      <div v-if="props.notification.description">
        <div>Description:</div>
        <div>
          {{ props.notification.description }}
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { type Notification } from '../db_models';
import { getNotificationTypeStr } from '../aux_functions';

const props = defineProps<{ notification: Notification }>();
</script>
