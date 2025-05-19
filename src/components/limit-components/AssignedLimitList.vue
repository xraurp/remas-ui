<template>
  <div class="q-gutter-md">
    <div class="text-h6">Resource usage limits</div>
    <q-separator />
    <q-btn
      label="Add limit"
      color="green"
      @click="onAddLimit"
      v-if="!is_profile"
    />
    <div class="q-pa-md row items-start q-gutter-md">
      <limit-item
        v-for="item in entityLimits"
        :key="item.id!"
        :limit="item"
        :user="users.find((u) => u.id === item.user_id)"
        :group="groups.find((g) => g.id === item.group_id)"
        :resource="
          resourceStore.getResources.find((r) => r.id === item.resource_id)
        "
        style="min-height: 200px; min-width: 400px"
      >
        <template v-slot:actions v-if="showRemoveButton(item)">
          <q-btn flat color="primary" @click="editLimit(item)" label="Edit" />
          <q-btn
            flat
            color="negative"
            @click="openConfirmDialog(item)"
            label="Remove"
          />
        </template>
      </limit-item>
    </div>
  </div>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="removeLimit()">
      <template v-slot:message>
        Are you sure you want to remove this limit?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import type { Limit, User, Group } from '../db_models';
import { computed, onMounted, ref } from 'vue';
import { getMessageFromError } from '../aux_functions';
import { useQuasar } from 'quasar';
import LimitItem from './LimitItem.vue';
import ConfirmRemoveDialog from '../ConfirmRemoveDialog.vue';
import { useLimitStore } from 'src/stores/limit-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { useRouter } from 'vue-router';
import { useUserGroupStore } from 'src/stores/user-group-store';

const props = defineProps<{
  user?: User;
  group?: Group;
  is_profile?: boolean;
}>();

const router = useRouter();
const limitStore = useLimitStore();
const userGroupStore = useUserGroupStore();
const resourceStore = useNodeResourceStore();
const $q = useQuasar();
const entityLimits = ref<Limit[]>([]);
const showRemoveDialog = ref(false);
const selectedLimit = ref<Limit>();
const users = computed(() => userGroupStore.users);
const groups = computed(() => userGroupStore.groups);

async function editLimit(limit: Limit) {
  await router.push({ name: 'limit', params: { id: limit.id } });
}

function openConfirmDialog(limit: Limit) {
  showRemoveDialog.value = true;
  selectedLimit.value = limit;
}

/**
 * Deletes a limit
 */
async function removeLimit() {
  if (!selectedLimit.value) {
    $q.notify({
      type: 'negative',
      message: 'Failed to remove limit!',
    });
    return;
  }
  const limit = selectedLimit.value;
  try {
    await limitStore.deleteLimit(limit);
    entityLimits.value = entityLimits.value.filter((l) => l.id !== limit.id);
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getMessageFromError(e, 'Failed to remove limit!'),
    });
  }
  showRemoveDialog.value = false;
}

/**
 * Checks if a limit is assigned to the current user or group
 * or inherited from parent.
 * @returns {boolean} True if the limit is assigned to the current user or group
 */
function showRemoveButton(limit: Limit) {
  if (props.user) {
    return limit.user_id === props.user.id;
  } else if (props.group) {
    return limit.group_id === props.group.id;
  }
  return false;
}

async function onAddLimit() {
  await router.push({ name: 'limit', params: { id: 'new' } });
}

onMounted(async () => {
  try {
    if (props.user && props.user.id) {
      entityLimits.value = await limitStore.getAllUserLimits(props.user.id);
    } else if (props.group && props.group.id) {
      entityLimits.value = await limitStore.getAllGroupLimits(props.group.id);
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch limits!'),
    });
  }
});
</script>
