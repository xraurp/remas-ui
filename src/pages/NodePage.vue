<template>
  <q-page padding>
    <NodeCreate v-if="numericId === undefined" />
    <NodeView :node_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import NodeView from 'src/components/NodeView.vue';
import NodeCreate from 'src/components/NodeCreate.vue';
import { getNumericId } from 'src/components/aux_functions';
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
