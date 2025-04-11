<template>
  <q-page padding>
    <!-- content -->
    <UserCreate v-if="getNumericId === undefined" />
    <UserView :user_id="getNumericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import UserView from 'src/components/UserView.vue';
import UserCreate from 'src/components/UserCreate.vue';
import { computed } from 'vue';

const props = defineProps<{
  id: string | undefined;
}>();

const getNumericId = computed(() => {
  if (props.id && props.id !== 'new') return Number(props.id);
  return undefined;
});
</script>
