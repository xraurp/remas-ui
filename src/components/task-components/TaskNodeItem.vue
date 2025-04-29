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
              :color="getChipColor(resource)"
              :label="getChipLabel(resource)"
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
import { Unit, type Limit, type Node, type NodeResource } from '../db_models';
import { getConversion } from '../aux_functions';
const props = defineProps<{
  node: Node;
  limits: Limit[];
}>();

/**
 * Retrurns most restrictive limit for a resource.
 * @param resource The resource to get the limit for.
 * @returns The most restrictive limit for the resource.
 */
function getLimitForResource(resource: NodeResource): Limit | undefined {
  const limits = props.limits
    .filter(
      (l) =>
        l.resource_id === resource.id &&
        l.node_ids.find((n) => n === props.node.id),
    )
    .sort((a, b) => b.amount - a.amount);

  return limits[0];
}

function getChipColor(resource: NodeResource): string {
  const limit = getLimitForResource(resource);
  if (limit && limit.amount < resource.amount) {
    return 'negative';
  }
  return 'primary';
}

function getChipLabel(resource: NodeResource): string {
  const limit = getLimitForResource(resource);
  const resourceAmount = getConversion(
    resource.amount,
    resource.unit || Unit.NONE,
  );
  // trim to remove whitespace at the end if no unit is displayed
  let label =
    `${resource.name}: ${resourceAmount.amount} ${resourceAmount.unit_str}`.trim();
  if (limit && limit.amount < resource.amount) {
    const limitAmount = getConversion(
      limit?.amount || 0,
      resource.unit || Unit.NONE,
    );
    label =
      label +
      `, Limited to: ${limitAmount.amount} ${limitAmount.unit_str}`.trim();
  }
  return label.trim();
}
</script>
