<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="groupName"
            label="Group name"
            :disable="readOnly"
            :rules="[(val) => !!val || 'Group must have a name']"
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
            v-model="usersShareStatistics"
            :options="usersShareStatisticsOptions"
            label="User share statistics"
            :disable="readOnly"
          />
          <q-select
            outlined
            v-model="parentGroup"
            :options="parentGroupOptions"
            label="Parent group"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Update group"
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
    <SelectedNotificationList
      v-if="group"
      :group="group"
    ></SelectedNotificationList>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { type Group } from '../db_models';
import { getMessageFromError } from '../aux_functions';
import { useQuasar } from 'quasar';
import SelectedNotificationList from '../notification-components/SelectedNotificationList.vue';

const props = defineProps<{
  group_id: number;
}>();

const userGroupStore = useUserGroupStore();
const $q = useQuasar();
const readOnly = ref(true);

onMounted(async () => {
  try {
    if (!userGroupStore.getGroups.length) {
      await userGroupStore.fetchGroups();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(error, 'Failed to fetch groups!');
    $q.notify({ type: 'negative', message });
  }
});

let group = userGroupStore.getGroupById(props.group_id);

const groupName = ref(group?.name || '');
const usersShareStatistics = ref(
  group?.users_share_statistics ? 'Enabled' : 'Disabled',
);
const description = ref(group?.description || '');
const usersShareStatisticsOptions = ['Disabled', 'Enabled'];
const parentGroup = ref(group?.parent?.name || 'None');
const parentGroupOptions = [
  'None',
  ...userGroupStore.getGroups.map((g) => g.name),
].filter((g) => g !== groupName.value);

function onCancel() {
  readOnly.value = true;
  parentGroup.value = group?.parent?.name || 'None';
  groupName.value = group?.name || '';
  usersShareStatistics.value = group?.users_share_statistics
    ? 'Enabled'
    : 'Disabled';
  description.value = group?.description || '';
}

function onEdit() {
  readOnly.value = false;
}

function compareEdit() {
  let cmp = groupName.value === group?.name;
  cmp =
    cmp &&
    usersShareStatistics.value ===
      (group?.users_share_statistics ? 'Enabled' : 'Disabled');
  cmp = cmp && description.value === group?.description;
  return cmp;
}

async function changeGroupParent() {
  await userGroupStore
    .changeGroupParent(
      group!,
      userGroupStore.getGroups.find((g) => g.name === parentGroup.value)!,
    )
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Group parent changed successfully!',
      });
      readOnly.value = true;
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(
        error,
        'Failed to change group parent!',
      );
      $q.notify({ type: 'negative', message });
    });
}

async function updateGroupData() {
  await userGroupStore
    .updateGroup(<Group>{
      id: group?.id || undefined,
      name: groupName.value,
      users_share_statistics: usersShareStatistics.value === 'Enabled',
      description: description.value,
      parent_id: userGroupStore.getGroups.find(
        (g) => g.name === parentGroup.value,
      )?.id,
    })
    .then((newGroup) => {
      if (process.env.debug) {
        console.log(newGroup);
      }
      $q.notify({
        type: 'positive',
        message: 'Group updated successfully!',
      });
      group = newGroup;
      readOnly.value = true;
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to update group!');
      $q.notify({ type: 'negative', message });
    });
}

async function onSubmit() {
  if (compareEdit() && parentGroup.value == (group?.parent?.name || 'None')) {
    $q.notify({
      type: 'info',
      color: 'primary',
      message: 'No changes detected',
    });
    readOnly.value = true;
    return;
  }
  if (parentGroup.value != (group?.parent?.name || 'None')) {
    await changeGroupParent();
  }
  if (!compareEdit()) {
    await updateGroupData();
  }
}
</script>
