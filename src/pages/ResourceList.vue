<template>
  <q-page padding>
    <div class="text-h3">Resources</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add resource" @click="addResource" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="resource in resources">
        <resource-item
          v-if="resource?.id"
          :key="resource.id"
          :resource="resource"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn flat color="primary" @click="editResource(resource)"
              >Edit</q-btn
            >
            <q-btn flat color="negative" @click="deleteResource(resource)"
              >Delete</q-btn
            >
          </template>
        </resource-item>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ResourceItem from 'src/components/ResourceItem.vue';
import type { Resource } from 'src/components/db_models';

const $q = useQuasar();
const nodeResourceStore = useNodeResourceStore();
const router = useRouter();

const resources = computed(() => nodeResourceStore.resources);

onMounted(async () => {
  try {
    await nodeResourceStore.fetchResources();
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch resources!'),
    });
  }
});

async function addResource() {
  await router.push({ name: 'resource', params: { id: 'new' } });
}

async function editResource(resource: Resource) {
  await router.push({ name: 'resource', params: { id: resource.id } });
}

async function deleteResource(resource: Resource) {
  try {
    await nodeResourceStore.deleteResource(resource);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete resource!'),
    });
  }
}
</script>
