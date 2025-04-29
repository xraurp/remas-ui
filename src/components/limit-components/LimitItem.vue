<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.limit.name }}</div>
      <q-separator />
      <div class="row">
        <div class="text-subtitle col">Resource:</div>
        <div class="text-subtitle col">{{ props.resource?.name }}</div>
      </div>
      <div class="row">
        <div class="text-subtitle col">Amount:</div>
        <div class="text-subtitle col">{{ amount_str }}</div>
      </div>
      <div class="row" v-if="props.user">
        <div class="text-subtitle col">Assigned to user:</div>
        <div class="text-subtitle col">{{ props.user.username }}</div>
      </div>
      <div class="row" v-if="props.group">
        <div class="text-subtitle col">Assigned to group:</div>
        <div class="text-subtitle col">{{ props.group.name }}</div>
      </div>
      <q-separator v-if="props.limit.description" />
      <div v-if="props.limit.description">
        <div>Description:</div>
        <div>{{ props.limit.description }}</div>
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Resource, Limit, User, Group } from '../db_models';
import { getConversion } from '../aux_functions';
import { computed } from 'vue';

const props = defineProps<{
  limit: Limit;
  resource: Resource | undefined;
  user: User | undefined;
  group: Group | undefined;
}>();
const amount_str = computed(() => {
  const { amount, unit_str } = getConversion(
    props.limit.amount,
    props.resource?.unit,
  );
  return `${amount} ${unit_str}`.trim();
});
</script>
