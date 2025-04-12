<template>
  <q-page padding>
    <!-- content -->
    <UserCreate v-if="numericId === undefined" />
    <UserView :user_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import UserView from 'src/components/UserView.vue';
import UserCreate from 'src/components/UserCreate.vue';
import { computed } from 'vue';
import { getNumericId } from 'src/components/aux_functions';

const props = defineProps<{
  id: string | undefined;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
