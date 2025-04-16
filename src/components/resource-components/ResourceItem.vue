<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.resource.name }}</div>
      <q-separator />
      <div class="text-subtitle" v-if="props.resource.description">
        Description:
      </div>
      <div class="text-subtitle" v-if="props.resource.description">
        {{ props.resource.description }}
      </div>
      <q-separator v-if="getAmountStr(props.resource as NodeResource)" />
      <div
        class="text-subtitle"
        v-if="getAmountStr(props.resource as NodeResource)"
      >
        Amount: {{ getAmountStr(props.resource as NodeResource) }}
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { type NodeResource, type Resource } from '../db_models';
import { getAmountStr } from '../aux_functions';

const props = defineProps<{ resource: Resource | NodeResource }>();
</script>
