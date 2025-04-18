<template>
  <q-page padding>
    <LimitCreate v-if="numericId === undefined" />
    <LimitView :limit_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import LimitCreate from 'src/components/limit-components/LimitCreate.vue';
import LimitView from 'src/components/limit-components/LimitView.vue';
import { getNumericId } from 'src/components/aux_functions';
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
