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
      <q-btn flat color="primary" @click="props.editFunction(props.user)"
        >Edit</q-btn
      >
      <q-btn flat color="negative" @click="delUser(props.user)">Delete</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from './db_models';
import { useQuasar } from 'quasar';
import { getMessageFromError } from './aux_functions';

const props = defineProps<{
  user: User;
  editFunction: (user: User) => Promise<void>;
  deleteFunction: (user: User) => Promise<void>;
}>();

const $q = useQuasar();

const getLetter = computed(() => {
  if (props.user.name && props.user.surname) {
    return props.user.name.charAt(0);
  }
  return props.user.username.charAt(0);
});

const showName = computed(() => {
  return props.user.name && props.user.surname;
});

async function delUser(user: User) {
  try {
    await props.deleteFunction(user);
  } catch (error) {
    if (process.env.dev) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete user!'),
    });
  }
}
</script>
