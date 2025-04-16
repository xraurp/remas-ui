<template>
  <q-page padding>
    <ResourceCreate v-if="numericId === undefined" />
    <ResourceView :resource_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import { getNumericId } from 'src/components/aux_functions';
import ResourceCreate from 'src/components/ResourceCreate.vue';
import ResourceView from 'src/components/ResourceView.vue';
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
