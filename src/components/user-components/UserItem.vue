<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section class="row">
      <q-card-section class="col">
        <div v-if="showName" class="text-h6">
          {{ props.user.name }} {{ props.user.surname }}
        </div>
        <div v-if="!showName" class="text-h6">{{ props.user.username }}</div>
        <q-separator />
        <div class="row">
          <div v-if="showName" class="text-subtitle col">Username:</div>
          <div v-if="showName" class="text-subtitle col">
            {{ props.user.username }}
          </div>
        </div>
        <div class="row">
          <div class="text-subtitle col">Group:</div>
          <div class="text-subtitle col">{{ props.user.group?.name }}</div>
        </div>
      </q-card-section>
      <q-card-section
        class="col"
        style="
          text-align: center;
          max-width: fit-content;
          max-height: fit-content;
        "
      >
        <q-avatar color="primary" text-color="white">{{ getLetter }}</q-avatar>
      </q-card-section>
    </q-card-section>

    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '../db_models';
import { getFirstLetter } from '../aux_functions';

const props = defineProps<{
  user: User;
}>();

const getLetter = computed(() => getFirstLetter(props.user));

const showName = computed(() => {
  return props.user.name && props.user.surname;
});
</script>
