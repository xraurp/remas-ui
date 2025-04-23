<template>
  <q-page padding>
    <div class="text-h3">Tasks</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add task" @click="addTask" />
    <div class="q-pa-md row items-start q-gutter-md"></div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

async function addTask() {
  await router.push({ name: 'task', params: { id: 'new' } });
}
</script>
