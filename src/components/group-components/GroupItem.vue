<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.group.name }}</div>
      <q-separator />
      <div class="row" v-if="props.group.parent">
        <div class="text-subtitle col">Parent name:</div>
        <div class="text-subtitle col">{{ props.group.parent?.name }}</div>
      </div>
      <q-separator v-if="props.group.description" />
      <div v-if="props.group.description">
        <div class="text-subtitle">Description:</div>
        <div class="text-subtitle">{{ props.group.description }}</div>
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { type Group } from '../db_models';

const props = defineProps<{ group: Group }>();
</script>
