<template>
  <q-page padding>
    <!-- content -->
    <UserView :is_profile="true" />
  </q-page>
</template>

<script setup lang="ts">
import UserView from 'src/components/user-components/UserView.vue';
</script>
