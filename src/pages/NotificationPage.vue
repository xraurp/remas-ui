<template>
  <q-page padding>
    <NotificationCreate v-if="numericId === undefined" />
    <NotificationView :notification_id="numericId" v-else />
  </q-page>
</template>

<script setup lang="ts">
import NotificationView from 'src/components/notification-components/NotificationView.vue';
import NotificationCreate from 'src/components/notification-components/NotificationCreate.vue';
import { getNumericId } from 'src/components/aux_functions';
import { computed } from 'vue';

const props = defineProps<{
  id?: string;
}>();

const numericId = computed(() => getNumericId(props.id));
</script>
