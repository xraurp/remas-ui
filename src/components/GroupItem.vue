<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.group.name }}</div>
      <q-separator v-if="props.group.parent" />
      <div class="row" v-if="props.group.parent">
        <div class="text-subtitle col">Parent name:</div>
        <div class="text-subtitle col">{{ props.group.parent?.name }}</div>
      </div>
      <q-separator />
      <div class="text-subtitle">Description:</div>
      <div class="text-subtitle">{{ props.group.description }}</div>
    </q-card-section>
    <q-card-actions align="around">
      <q-btn flat color="primary" @click="props.editFunction(props.group)"
        >Edit</q-btn
      >
      <q-btn flat color="negative" @click="delGroup(props.group)">Delete</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { getMessageFromError } from './aux_functions';
import { type Group } from './db_models';
import { useQuasar } from 'quasar';

const props = defineProps<{
  group: Group;
  editFunction: (group: Group) => Promise<void>;
  deleteFunction: (group: Group) => Promise<void>;
}>();
const $q = useQuasar();

async function delGroup(group: Group) {
  try {
    await props.deleteFunction(group);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete group!'),
    });
  }
}
</script>
