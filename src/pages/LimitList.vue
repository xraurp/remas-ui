<template>
  <q-page padding>
    <div class="text-h3">Limits</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add limit" @click="addLimit" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="item in limits">
        <limit-item
          v-if="item?.id"
          :key="item.id"
          :limit="item"
          :resource="resources.find((r) => r.id === item.resource_id)"
          :user="users.find((u) => u.id === item.user_id)"
          :group="groups.find((g) => g.id === item.group_id)"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn flat color="primary" label="Edit" @click="editLimit(item)" />
            <q-btn
              flat
              color="negative"
              label="Delete"
              @click="openConfirmDialog(item)"
            />
          </template>
        </limit-item>
      </template>
    </div>
  </q-page>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="deleteLimit()">
      <template v-slot:message>
        Are you sure you want to remove this limit?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLimitStore } from 'src/stores/limit-store';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { type Limit } from 'src/components/db_models';
import LimitItem from 'src/components/limit-components/LimitItem.vue';
import ConfirmRemoveDialog from 'src/components/ConfirmRemoveDialog.vue';
import { ref } from 'vue';

const router = useRouter();
const limitStore = useLimitStore();
const userGroupStore = useUserGroupStore();
const nodeResourceStore = useNodeResourceStore();
const $q = useQuasar();
const resources = computed(() => nodeResourceStore.getResources);
const limits = computed(() => limitStore.getLimits);
const users = computed(() => userGroupStore.getUsers);
const groups = computed(() => userGroupStore.getGroups);
const selectedLimit = ref<Limit | null>(null);
const showRemoveDialog = ref(false);

onMounted(async () => {
  try {
    await limitStore.fetchLimits();
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
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch data from server!'),
    });
  }
});

function openConfirmDialog(limit: Limit) {
  selectedLimit.value = limit;
  showRemoveDialog.value = true;
}

async function editLimit(limit: Limit) {
  await router.push({ name: 'limit', params: { id: limit.id } });
}

async function addLimit() {
  await router.push({ name: 'limit', params: { id: 'new' } });
}

async function deleteLimit() {
  try {
    await limitStore.deleteLimit(selectedLimit.value!);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete limit!'),
    });
  }
  showRemoveDialog.value = false;
}
</script>
