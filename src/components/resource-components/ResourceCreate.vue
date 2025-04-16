<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input outlined v-model="resourceName" label="Resource name" />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
          />
        </div>
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-select
            outlined
            v-model="selectedUnit"
            :options="unitOptions"
            label="Select unit"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Create resource"
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
import { useQuasar } from 'quasar';
import { getMessageFromError } from '../aux_functions';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { Unit } from 'src/components/db_models';

const resourceStore = useNodeResourceStore();
const router = useRouter();
const $q = useQuasar();

onMounted(async () => {
  try {
    if (!resourceStore.getResources.length) {
      await resourceStore.fetchResources();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to fetch resources!');
    $q.notify({ type: 'negative', message });
  }
});

const resourceName = ref('');
const description = ref('');
const selectedUnit = ref(Unit.NONE);
const unitOptions = [Unit.NONE, Unit.BYTES_IEC, Unit.BYTES_SI];

function onCancel() {
  router.back();
}

async function onSubmit() {
  await resourceStore
    .createResource({
      name: resourceName.value,
      description: description.value,
      unit: selectedUnit.value,
    })
    .then(async (newResource) => {
      if (process.env.debug) {
        console.log(newResource);
      }
      $q.notify({
        type: 'positive',
        message: 'Resource created successfully!',
      });
      await router.push({ name: 'resource', params: { id: newResource.id } });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to create resource!');
      $q.notify({ type: 'negative', message });
    });
}
</script>
