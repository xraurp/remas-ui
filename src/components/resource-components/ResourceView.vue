<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="resourceName"
            label="Resource name"
            :disable="readOnly"
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
            :disable="readOnly"
          />
        </div>
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-select
            outlined
            v-model="selectedUnit"
            :options="unitOptions"
            label="Select unit"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Update resource"
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
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { onMounted, ref } from 'vue';
import { getMessageFromError } from '../aux_functions';
import { Unit } from '../db_models';

const props = defineProps<{ resource_id: number }>();

const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();
const readOnly = ref(true);

onMounted(async () => {
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
});

let resource = nodeResourceStore.getResources.find(
  (r) => r.id === props.resource_id,
);
const resourceName = ref(resource?.name || '');
const description = ref(resource?.description || '');
const selectedUnit = ref(resource?.unit || Unit.NONE);
const unitOptions = [Unit.NONE, Unit.BYTES_IEC, Unit.BYTES_SI];

function onEdit() {
  readOnly.value = false;
}

function onCancel() {
  readOnly.value = true;
  resourceName.value = resource?.name || '';
  description.value = resource?.description || '';
  selectedUnit.value = resource?.unit || Unit.NONE;
}

async function onSubmit() {
  await nodeResourceStore
    .updateResource({
      id: props.resource_id,
      name: resourceName.value,
      description: description.value,
      unit: selectedUnit.value,
    })
    .then((newResource) => {
      $q.notify({
        type: 'positive',
        message: 'Resource updated successfully!',
      });
      resource = newResource;
      onCancel();
    })
    .catch((error) => {
      const message = getMessageFromError(error, 'Failed to update resource!');
      $q.notify({ type: 'negative', message });
    });
}
</script>
