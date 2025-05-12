<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="limitName"
            label="Limit name"
            :rules="[(val) => !!val || 'Limit name is required!']"
            :disable="readOnly"
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
            :disable="readOnly"
          />
          <q-select
            outlined
            v-model="target"
            :options="targetOptions"
            label="Select target user or group"
            clearable
            option-label="name"
            :rules="[(val) => !!val || 'Target user or group is required!']"
            :disable="readOnly"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.realName">{{
                    scope.opt.realName
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ scope.opt.type }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            outlined
            v-model="resource"
            :options="resourceOptions"
            label="Select resource"
            clearable
            option-label="name"
            :rules="[(val) => !!val || 'Resource is required!']"
            @update:model-value="(value) => onResourceChanged(value)"
            :disable="readOnly"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{
                    scope.opt.description
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip v-for="alias in scope.opt.aliases" :key="alias.id">{{
                    alias.name
                  }}</q-chip>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="selectedAmount"
            type="number"
            label="Amount"
            :rules="[(val) => !!val || 'Amount is required!']"
            class="col"
            :disable="readOnly"
          />
          <q-select
            outlined
            v-model="unit"
            :options="unitOptions"
            label="Unit"
            option-label="name"
            class="col-3"
            :disable="unitOptions.length < 2 || readOnly"
          />
        </div>
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-select
            outlined
            v-model="nodes"
            :options="nodeOptions"
            label="Select nodes"
            option-label="name"
            multiple
            use-chips
            :rules="[(val) => !!val || 'Nodes are required!']"
            :disable="readOnly"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{
                    scope.opt.description
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Update limit"
            type="submit"
            color="primary"
            class="col"
          />
          <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
        </div>
        <div class="row q-gutter-sm" v-else>
          <q-btn label="Edit" color="primary" class="col" @click="onEdit" />
          <div class="col"></div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import {
  getConversion,
  getConversionInverse,
  getMessageFromError,
  getUnitList,
} from '../aux_functions';
import { useLimitStore } from 'src/stores/limit-store';
import { useQuasar } from 'quasar';
import { Unit } from '../db_models';
import type { Resource, Node } from '../db_models';

const props = defineProps<{
  limit_id: number;
}>();

interface TargetValue {
  id: number | undefined;
  name: string;
  realName?: string;
  type: string;
}

const router = useRouter();
const userGroupStore = useUserGroupStore();
const nodeResourceStore = useNodeResourceStore();
const limitStore = useLimitStore();
const $q = useQuasar();
const readOnly = ref(true);

let limit = limitStore.getLimits.find((l) => l.id === props.limit_id);

if (!limit) {
  $q.notify({ type: 'negative', message: 'Limit not found!' });
  router.back();
}

const limitName = ref('');
const description = ref('');
const target = ref<TargetValue | null>(null);
const targetType = ref('User');
const resource = ref<Resource | null>(null);
const selectedAmount = ref(0);
const unit = ref('');
const nodes = ref<Node[]>([]);

const targetOptions = computed(() => {
  const data = [];
  for (const user of userGroupStore.getUsers) {
    data.push({
      name: user.username,
      realName: `${user.name} ${user.surname}`.trim(),
      type: 'User',
      id: user.id,
    });
  }
  for (const group of userGroupStore.getGroups) {
    data.push({ name: group.name, type: 'Group', id: group.id });
  }
  return data;
});

const resourceOptions = computed(() => nodeResourceStore.getResources);
const nodeOptions = computed(() => nodeResourceStore.getNodes);
const unitOptions = ref<string[]>([]);

function onResourceChanged(value: Resource | null) {
  if (value) {
    unitOptions.value = getUnitList(value.unit || Unit.NONE);
    unit.value = unitOptions.value[0] || '';
  }
}

function resetEditValues() {
  limitName.value = limit?.name || '';
  description.value = limit?.description || '';
  if (limit?.user_id) {
    target.value =
      targetOptions.value.find(
        (t) => t.id === limit?.user_id && t.type === 'User',
      ) || null;
  } else {
    target.value =
      targetOptions.value.find(
        (t) => t.id === limit?.group_id && t.type === 'Group',
      ) || null;
  }
  targetType.value = target.value?.type || 'User';
  resource.value =
    resourceOptions.value.find((r) => r.id === limit?.resource_id) || null;
  const { amount, unit_str } = getConversion(
    limit?.amount || 0,
    resource.value?.unit || Unit.NONE,
  );
  selectedAmount.value = amount || 0;
  unit.value = unit_str || unitOptions.value[0] || '';
  for (const node of nodeOptions.value) {
    if (
      node.id &&
      limit?.node_ids.includes(node.id) &&
      !nodes.value.includes(node)
    ) {
      nodes.value.push(node);
    }
  }
}

resetEditValues();

function compareNodes() {
  if (nodes.value.length !== limit?.node_ids.length) {
    return false;
  }
  for (const node of nodes.value) {
    if (!node.id || !limit?.node_ids.includes(node.id)) {
      return false;
    }
  }
  return true;
}

function compareEdit() {
  let cmp = limitName.value === limit?.name;
  cmp = cmp && description.value === limit?.description;
  if (target.value?.type === 'User') {
    cmp = cmp && target.value?.id === limit?.user_id;
  } else {
    cmp = cmp && target.value?.id === limit?.group_id;
  }
  // check if target was not changed from user to group or vice versa
  cmp = cmp && target.value?.type === targetType.value;
  cmp = cmp && resource.value?.id === limit?.resource_id;
  cmp =
    cmp &&
    limit?.amount ===
      getConversionInverse(
        selectedAmount.value,
        unit.value,
        resource.value?.unit || Unit.NONE,
      );
  cmp = cmp && compareNodes();
  return cmp;
}

function onCancel() {
  readOnly.value = true;
  resetEditValues();
}

function onEdit() {
  readOnly.value = false;
}

async function onSubmit() {
  // check for changes
  if (compareEdit()) {
    $q.notify({
      type: 'info',
      color: 'primary',
      message: 'No changes detected',
    });
    readOnly.value = true;
    return;
  }
  // check required fields
  if (!target.value) {
    $q.notify({
      type: 'negative',
      message: 'User or group is required!',
    });
    return;
  }
  if (!resource.value?.id) {
    $q.notify({
      type: 'negative',
      message: 'Resource is required!',
    });
    return;
  }
  if (nodes.value.length < 1) {
    $q.notify({
      type: 'negative',
      message: 'No nodes are selected!',
    });
    return;
  }
  // get node id list
  const nodeIds = [];
  for (const node of nodes.value) {
    if (node.id) {
      nodeIds.push(node.id);
    }
  }
  // get target entity
  let user_id = null;
  let group_id = null;
  if (!target.value.id) {
    $q.notify({
      type: 'negative',
      message: 'User or group is required!',
    });
    return;
  }
  if (target.value.type === 'User') {
    user_id = target.value.id;
  } else {
    group_id = target.value.id;
  }
  // send update to backend
  await limitStore
    .updateLimit({
      id: limit?.id || 0,
      name: limitName.value,
      description: description.value,
      user_id,
      group_id,
      resource_id: resource.value?.id || 0,
      amount: getConversionInverse(
        selectedAmount.value,
        unit.value,
        resource.value?.unit,
      ),
      node_ids: nodeIds,
    })
    .then((newLimit) => {
      if (process.env.debug) {
        console.log(newLimit);
      }
      $q.notify({
        type: 'positive',
        message: 'Limit updated successfully!',
      });
      limit = newLimit;
      readOnly.value = true;
      resetEditValues();
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to update limit!');
      $q.notify({
        type: 'negative',
        message,
      });
    });
}

onMounted(async () => {
  try {
    if (!limitStore.getLimits.length) {
      await limitStore.fetchLimits();
    }
    if (!userGroupStore.getUsers.length) {
      await userGroupStore.fetchUsers();
    }
    if (!userGroupStore.getGroups.length) {
      await userGroupStore.fetchGroups();
    }
    if (!nodeResourceStore.getResources.length) {
      await nodeResourceStore.fetchResources();
    }
    if (!nodeResourceStore.getNodes.length) {
      await nodeResourceStore.fetchNodes();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(
      error,
      'Failed to fetch data from the server!',
    );
    $q.notify({ type: 'negative', message });
  }
  unitOptions.value = getUnitList(resource.value?.unit || Unit.NONE);
});
</script>
