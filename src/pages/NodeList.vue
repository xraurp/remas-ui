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
            <q-btn flat color="negative" @click="openConfirmDialog(item)"
              >Delete</q-btn
            >
          </template>
        </node-item>
      </template>
    </div>
  </q-page>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="deleteNode()">
      <template v-slot:message>
        Are you sure you want to remove this node?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import NodeItem from 'src/components/node-components/NodeItem.vue';
import { useRouter } from 'vue-router';
import { type Node } from 'src/components/db_models';
import ConfirmRemoveDialog from 'src/components/ConfirmRemoveDialog.vue';
import { ref } from 'vue';

const $q = useQuasar();
const nodeResourceStore = useNodeResourceStore();
const router = useRouter();
const nodes = computed(() => nodeResourceStore.getNodes);
const selectedNode = ref<Node | null>(null);
const showRemoveDialog = ref(false);

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

function openConfirmDialog(node: Node) {
  selectedNode.value = node;
  showRemoveDialog.value = true;
}

async function editNode(node: Node) {
  await router.push({ name: 'node', params: { id: node.id } });
}

async function addNode() {
  await router.push({ name: 'node', params: { id: 'new' } });
}

async function deleteNode() {
  try {
    await nodeResourceStore.deleteNode(selectedNode.value!);
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
