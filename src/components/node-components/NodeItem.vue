<template>
  <q-card class="q-gutter-md q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ props.node.name }}</div>
      <q-separator />
      <div v-if="props.node.description">
        <div>Description:</div>
        <div>
          {{ props.node.description }}
        </div>
      </div>
      <q-separator v-if="props.node.resources?.length" />
      <div v-if="props.node.resources?.length">
        <div class="text-subtitle">Resources:</div>
        <div>
          <template v-for="resource in props.node.resources">
            <q-chip
              v-if="resource.id"
              :key="resource.id"
              :label="getChipLabel(resource)"
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
import type { Node, NodeResource } from '../db_models';
import { getAmountStr } from '../aux_functions';
const props = defineProps<{
  node: Node;
}>();

function getChipLabel(resource: NodeResource): string {
  return `${resource.name}: ${getAmountStr(resource)}`;
}
</script>
