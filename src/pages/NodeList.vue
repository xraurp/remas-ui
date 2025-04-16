<template>
  <q-page padding>
    <div class="text-h3">Nodes</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add node" @click="addNode" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="item in nodes">
        <node-item
          v-if="item?.id"
          :key="item.id"
          :node="item"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn flat color="primary" @click="editNode(item)">Edit</q-btn>
            <q-btn flat color="negative" @click="deleteNode(item)"
              >Delete</q-btn
            >
          </template>
        </node-item>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import NodeItem from 'src/components/NodeItem.vue';
import { useRouter } from 'vue-router';
import { type Node } from 'src/components/db_models';

const $q = useQuasar();
const nodeResourceStore = useNodeResourceStore();
const router = useRouter();
const nodes = computed(() => nodeResourceStore.getNodes);

onMounted(async () => {
  try {
    await nodeResourceStore.fetchNodes();
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch nodes!'),
    });
  }
});

async function editNode(node: Node) {
  await router.push({ name: 'node', params: { id: node.id } });
}

async function addNode() {
  await router.push({ name: 'node', params: { id: 'new' } });
}

async function deleteNode(node: Node) {
  try {
    await nodeResourceStore.deleteNode(node);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete node!'),
    });
  }
}
</script>
