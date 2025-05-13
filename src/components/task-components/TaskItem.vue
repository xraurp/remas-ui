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
        <div class="col">{{ getOwnerName(props.task) }}</div>
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
          <q-chip
            v-for="tag in props.task.tags"
            :key="tag.id!"
            :label="tag.name"
            color="primary"
          />
        </div>
      </div>
    </q-card-section>
    <q-card-section v-if="nodes.length">
      <div class="text-subtitle">Nodes:</div>
      <div>
        <node-item v-for="node in nodes" :key="node.id!" :node="node" />
      </div>
    </q-card-section>
    <q-card-actions align="around">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { TaskResponse, Node } from '../db_models';
import { formatDatetime } from '../calendarDateFormat';
import { computed } from 'vue';
import NodeItem from '../node-components/NodeItem.vue';

const props = defineProps<{
  task: TaskResponse;
  show_owner: boolean;
}>();

/**
 * Creates list of nodes and resources allocated to the task on each node.
 * @param task The task to get the node allocation for.
 * @returns A list of nodes and resources allocated to the task.
 */
function getNodeAllocation(task: TaskResponse) {
  const nodes: Node[] = [];
  if (!task.resources) {
    return nodes;
  }
  for (const allocation of task.resources) {
    let node = nodes.find((node) => node.id === allocation.node.id);
    if (!node) {
      node = allocation.node;
    }
    if (
      !node.resources?.find(
        (resource) => resource.id === allocation.resource.id,
      )
    ) {
      if (!node.resources) {
        node.resources = [];
      }
      node.resources.push({
        id: allocation.resource.id!,
        name: allocation.resource.name,
        description: allocation.resource.description ?? null,
        amount: allocation.amount,
        unit: allocation.resource.unit,
      });
    }
  }
  return nodes;
}

function getOwnerName(task: TaskResponse) {
  const owner = task.owner;
  if (!owner) {
    return '';
  }
  if (owner.name && owner.surname) {
    return `${owner.name} ${owner.surname}`;
  }
  return owner.username;
}

const nodes = computed(() => getNodeAllocation(props.task));
</script>
