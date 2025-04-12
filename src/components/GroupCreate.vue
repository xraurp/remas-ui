<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="q-gutter-sm" style="padding-bottom: 5px">
          <q-input outlined v-model="groupName" label="Group name" />
          <q-input
            outlined
            v-model="description"
            label="Description"
            type="textarea"
          />
          <q-select
            outlined
            v-model="usersShareStatistics"
            :options="usersShareStatisticsOptions"
            label="User share statistics"
          />
          <q-select
            outlined
            v-model="parentGroup"
            :options="parentGroupOptions"
            label="Parent group"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Create group"
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
import { useUserGroupStore } from 'src/stores/user-group-store';
import { type Group } from './db_models';
import { getMessageFromError } from './aux_functions';
import { useQuasar } from 'quasar';

const router = useRouter();
const userGroupStore = useUserGroupStore();
const $q = useQuasar();

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

const parentGroup = ref('None');
const parentGroupOptions = [
  ...userGroupStore.getGroups.map((g) => g.name),
  'None',
];

const groupName = ref('');
const usersShareStatistics = ref('Disabled');
const description = ref('');
const usersShareStatisticsOptions = ['Disabled', 'Enabled'];

function onCancel() {
  router.back();
}

async function onSubmit() {
  await userGroupStore
    .createGroup(<Group>{
      name: groupName.value,
      users_share_statistics: usersShareStatistics.value === 'Enabled',
      description: description.value,
      parent_id: userGroupStore.getGroups.find(
        (g) => g.name === parentGroup.value,
      )?.id,
    })
    .then(async (newGroup) => {
      if (process.env.debug) {
        console.log(newGroup);
      }
      $q.notify({
        type: 'positive',
        message: 'Group created successfully!',
      });
      await router.push({ name: 'group', params: { id: newGroup.id } });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to create group!');
      $q.notify({ type: 'negative', message });
    });
}
</script>
