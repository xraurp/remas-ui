<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.task.name }}</div>
      <q-separator />
      <div class="row">
        <div class="col">Start time:</div>
        <div class="col">
          {{ formatDatetime(props.task.start_time) }}
        </div>
      </div>
      <div class="row">
        <div class="col">End time:</div>
        <div class="col">
          {{ formatDatetime(props.task.end_time) }}
        </div>
      </div>
      <div class="row" v-if="props.task.status">
        <div class="col">Status:</div>
        <div class="col">
          {{ props.task.status }}
        </div>
      </div>
      <div class="row" v-if="props.task.owner && props.show_owner">
        <div class="col">Task owner:</div>
        <div class="col">{{ props.task.owner.name }}</div>
      </div>
      <q-separator v-if="props.task.description" />
      <div v-if="props.task.description">
        <div>Description:</div>
        <div>
          {{ props.task.description }}
        </div>
      </div>
      <!--
        TODO - add resource allocation display (node and allocated resources)
      -->
      <q-separator v-if="props.task.tags?.length" />
      <div v-if="props.task.tags?.length">
        <div class="text-subtitle">Tags:</div>
        <div>
          <template v-for="tag in props.task.tags">
            <q-chip
              v-if="tag.id"
              :key="tag.id"
              :label="tag.name"
              color="primary"
            />
          </template>
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Task } from '../db_models';
import { formatDatetime } from '../calendarDateFormat';

const props = defineProps<{
  task: Task;
  show_owner: boolean;
}>();
</script>
