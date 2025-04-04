<template>
  <q-page padding>
    <!-- content -->
    <UserView :groups="groups" :create-new="true" />
  </q-page>
</template>

<script setup lang="ts">
import UserView from 'src/components/UserView.vue';
import { ref } from 'vue';
import type { Group } from 'src/components/db_models';

const groups = ref<Group[]>([
  {
    id: 1,
    name: 'All users',
    description: 'Group 1 description',
  },
  {
    id: 2,
    name: 'Administrators',
    description: 'Group 2 description',
  },
  {
    id: 3,
    name: 'Users',
    description: 'Group 3 description',
  },
]);
//
</script>
