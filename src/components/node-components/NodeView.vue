<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="nodeName"
            label="Node name"
            :disable="readOnly"
            :rules="[(val) => !!val || 'Node must have a name']"
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Update node"
            type="submit"
            color="primary"
            class="col"
          />
          <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
        </div>
        <div class="row q-gutter-sm" v-if="readOnly">
          <q-btn label="Edit" color="primary" class="col" @click="onEdit" />
          <div class="col"></div>
        </div>
      </q-form>
    </div>
    <div>
      <div class="row q-gutter-sm" style="padding-top: 25px">
        <div class="col text-h5">Resources</div>
        <div class="col"></div>
      </div>
      <q-separator class="q-mb-md"></q-separator>
      <q-btn
        :label="getAddResourceButtonLabel()"
        color="green"
        @click="onAddResource"
      />
      <div class="q-pa-md row items-start q-gutter-md">
        <template v-for="resource in node?.resources">
          <ResourceItem
            v-if="resource.id"
            :key="resource.id"
            :resource="resource"
            :node_id="node_id"
            style="min-height: 200px; min-width: 400px"
          >
            <template v-slot:actions>
              <q-btn flat color="primary" @click="editAmount(resource)"
                >Edit amount</q-btn
              >
              <q-btn flat color="negative" @click="showRemoveDialog(resource)"
                >Remove</q-btn
              >
            </template>
          </ResourceItem>
        </template>
      </div>
      <div v-if="showResourceList">
        <div class="row q-gutter-sm row" style="padding-top: 15px">
          <div class="col text-h5">Resources to add</div>
          <div class="col"></div>
        </div>
        <q-separator></q-separator>
        <div class="q-pa-md row items-start q-gutter-md">
          <template v-for="resource in resourceList">
            <ResourceItem
              v-if="resource.id"
              :key="resource.id"
              :resource="resource"
              :node_id="node_id"
              style="min-height: 200px; min-width: 400px"
              ><template v-slot:actions>
                <q-btn
                  flat
                  color="primary"
                  @click="editAmount(resource as NodeResource)"
                  >Add</q-btn
                >
              </template>
            </ResourceItem>
          </template>
        </div>
      </div>
    </div>
    <q-dialog v-model="openDialog" persistent>
      <ResourceAmountDialog
        :starting-amount="amount"
        :unit-type="selectedResource?.unit || Unit.NONE"
        v-on:confirm-amount="confirmAddResource"
      />
    </q-dialog>
    <q-dialog v-model="openConfirmRemoveDialog" persistent>
      <ConfirmRemoveDialog @confirm="removeResource()">
        <template v-slot:message>
          Are you sure you want to remove this resource?
        </template>
      </ConfirmRemoveDialog>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { computed, onMounted, ref } from 'vue';
import { getConversionInverse, getMessageFromError } from '../aux_functions';
import { useQuasar } from 'quasar';
import type { NodeResource, Resource } from '../db_models';
import { Unit } from '../db_models';
import ResourceItem from 'src/components/resource-components/ResourceItem.vue';
import ResourceAmountDialog from 'src/components/resource-components/ResourceAmountDialog.vue';
import ConfirmRemoveDialog from 'src/components/ConfirmRemoveDialog.vue';

const props = defineProps<{
  node_id: number;
}>();

const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();
const readOnly = ref(true);
const showResourceList = ref(false);

// add resource dialog
const selectedResource = ref<Resource>();
const openDialog = ref(false);
const openConfirmRemoveDialog = ref(false);
const amount = ref(0);

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

let node = nodeResourceStore.getNodes.find((n) => n.id === props.node_id);
const resourceList = computed(() =>
  nodeResourceStore.getResources.filter(
    (r) => !node?.resources?.find((n) => n.id === r.id),
  ),
);
const nodeName = ref(node?.name || '');
const description = ref(node?.description || '');

async function onAddResource() {
  // hide resource list if it is open
  if (showResourceList.value) {
    showResourceList.value = false;
    return;
  }

  // show resource list && fetch resources
  showResourceList.value = true;
  try {
    if (!nodeResourceStore.getResources.length) {
      await nodeResourceStore.fetchResources();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to fetch resources!');
    $q.notify({ type: 'negative', message });
  }
}

function getAddResourceButtonLabel(): string {
  if (showResourceList.value) {
    return 'Hide resource list';
  }
  return 'Add resource';
}

async function removeResource() {
  const resource = selectedResource.value;
  if (!node || !resource) {
    $q.notify({ type: 'negative', message: 'Failed to remove resource!' });
    return;
  }
  try {
    await nodeResourceStore.removeResourceFromNode(node, resource);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to remove resource!');
    $q.notify({ type: 'negative', message });
    return;
  }
  node.resources = node.resources?.filter((r) => r.id !== resource.id) || [];
  openConfirmRemoveDialog.value = false;
}

function editAmount(resource: NodeResource) {
  openDialog.value = true;
  selectedResource.value = resource;
  amount.value = resource.amount;
}

function showRemoveDialog(resource: NodeResource) {
  openConfirmRemoveDialog.value = true;
  selectedResource.value = resource;
}

async function confirmAddResource(newAmount: {
  amount: number;
  unit_str: string;
}) {
  if (!node || !selectedResource.value) {
    $q.notify({ type: 'negative', message: 'Failed to add resource!' });
    return;
  }
  const _amount = getConversionInverse(
    newAmount.amount,
    newAmount.unit_str,
    selectedResource.value.unit,
  );
  try {
    await nodeResourceStore.addResourceToNode(
      node,
      selectedResource.value,
      _amount,
    );
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to add resource!');
    $q.notify({ type: 'negative', message });
    return;
  }
  if (!node.resources) {
    node.resources = [];
  }
  // try to find selected resource in node resources and replace amount
  const srInstance = node.resources.find(
    (r) => r.id === selectedResource.value?.id,
  );
  if (srInstance) {
    srInstance.amount = _amount;
  } else {
    // add new resource
    node.resources.push({
      id: selectedResource.value.id || -1,
      amount: _amount,
      name: selectedResource.value.name,
      description: selectedResource.value.description || '',
      unit: selectedResource.value.unit,
    });
  }
}

function onEdit() {
  readOnly.value = false;
}

function onCancel() {
  readOnly.value = true;
  nodeName.value = node?.name || '';
  description.value = node?.description || '';
}

async function onSubmit() {
  await nodeResourceStore
    .updateNode({
      id: props.node_id,
      name: nodeName.value,
      description: description.value,
    })
    .then((newNode) => {
      if (process.env.debug) {
        console.log(newNode);
      }
      $q.notify({
        type: 'positive',
        message: 'Node updated successfully!',
      });
      node = newNode;
      onCancel();
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to update node!');
      $q.notify({ type: 'negative', message });
    });
}
</script>
