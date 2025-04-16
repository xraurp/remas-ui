<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input outlined v-model="nodeName" label="Node name" />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Create node"
            type="submit"
            color="primary"
            class="col"
          />
          <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getMessageFromError } from '../aux_functions';
import { useQuasar } from 'quasar';
import { useNodeResourceStore } from 'src/stores/node-resource-store';

const router = useRouter();
const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();

onMounted(async () => {
  try {
    if (!nodeResourceStore.getNodes.length) {
      await nodeResourceStore.fetchNodes();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to fetch nodes!');
    $q.notify({ type: 'negative', message });
  }
});

const nodeName = ref('');
const description = ref('');

function onCancel() {
  router.back();
}

async function onSubmit() {
  await nodeResourceStore
    .createNode({
      name: nodeName.value,
      description: description.value,
    })
    .then(async (newNode) => {
      if (process.env.debug) {
        console.log(newNode);
      }
      $q.notify({
        type: 'positive',
        message: 'Node created successfully!',
      });
      await router.push({ name: 'node', params: { id: newNode.id } });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to create node!');
      $q.notify({ type: 'negative', message });
    });
}
</script>
