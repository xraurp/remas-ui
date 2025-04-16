<template>
  <q-page padding>
    <GroupCreate v-if="numericId === undefined" />
    <GroupView :group_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import GroupView from 'src/components/group-components/GroupView.vue';
import GroupCreate from 'src/components/group-components/GroupCreate.vue';
import { getNumericId } from 'src/components/aux_functions';
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
