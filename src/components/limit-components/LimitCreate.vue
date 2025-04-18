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
          />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
          />
          <q-select
            outlined
            v-model="target"
            :options="targetOptions"
            label="Select target user or group"
            clearable
            option-label="name"
            :rules="[(val) => !!val || 'Target user or group is required!']"
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
            v-model="amount"
            type="number"
            label="Amount"
            :rules="[(val) => !!val || 'Amount is required!']"
            class="col"
          />
          <q-select
            outlined
            v-model="unit"
            :options="unitOptions"
            label="Unit"
            option-label="name"
            class="col-3"
            :disable="unitOptions.length < 2"
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

        <div class="row q-gutter-sm">
          <q-btn
            label="Create limit"
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
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import {
  getConversionInverse,
  getMessageFromError,
  getUnitList,
} from '../aux_functions';
import { useLimitStore } from 'src/stores/limit-store';
import { useQuasar } from 'quasar';
import { type Resource, type Node, Unit } from '../db_models';

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

onMounted(async () => {
  try {
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
      'Failed to fetch users and groups!',
    );
    $q.notify({ type: 'negative', message });
  }
});

const limitName = ref('');
const description = ref('');
const target = ref<TargetValue | null>(null);
const resource = ref<Resource | null>(null);
const amount = ref(0);
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
const unitOptions = ref(getUnitList(resource.value?.unit || Unit.NONE));

function onResourceChanged(value: Resource | null) {
  if (value) {
    unitOptions.value = getUnitList(value.unit || Unit.NONE);
    unit.value = unitOptions.value[0] || '';
  }
}

function onCancel() {
  router.back();
}

async function onSubmit() {
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
  const nodeIds = [];
  for (const node of nodes.value) {
    if (node.id) {
      nodeIds.push(node.id);
    }
  }
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
  } else if (target.value.type === 'Group') {
    group_id = target.value.id;
  }
  await limitStore
    .createLimit({
      name: limitName.value,
      description: description.value,
      user_id: user_id,
      group_id: group_id,
      resource_id: resource.value?.id,
      amount: getConversionInverse(
        amount.value,
        unit.value,
        resource.value?.unit || Unit.NONE,
      ),
      node_ids: nodeIds,
    })
    .then(async (newLimit) => {
      if (process.env.debug) {
        console.log(newLimit);
      }
      $q.notify({
        type: 'positive',
        message: 'Limit created successfully!',
      });
      await router.push({ name: 'limit', params: { id: newLimit.id } });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to create limit!');
      $q.notify({
        type: 'negative',
        message,
      });
    });
}
</script>
