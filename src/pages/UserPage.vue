<template>
  <q-page padding>
    <!-- content -->
    <UserView :create-new="createNew" :user_id="getNumericId" />
  </q-page>
</template>

<script setup lang="ts">
import UserView from 'src/components/UserView.vue';
import { computed } from 'vue';

const props = defineProps<{
  id: string | undefined;
}>();

const createNew = computed(() => {
  return !props.id;
});

const getNumericId = computed(() => {
  return Number(props.id);
});
</script>
