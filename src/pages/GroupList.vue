<template>
  <q-page padding>
    <div class="text-h3">Groups</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add group" @click="addGroup" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="group in groups">
        <group-item
          v-if="group?.id"
          :key="group.id"
          :group="group"
          :edit-function="editFunction"
          :delete-function="userGroupStore.deleteGroup"
          style="min-height: 200px; min-width: 400px"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { type Group } from 'src/components/db_models';
import GroupItem from 'src/components/GroupItem.vue';

const router = useRouter();
const userGroupStore = useUserGroupStore();
const $q = useQuasar();
const groups = computed(() => userGroupStore.getGroups);

onMounted(async () => {
  try {
    await userGroupStore.fetchGroups();
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch groups!'),
    });
  }
});

async function editFunction(group: Group) {
  await router.push({ name: 'group', params: { id: group.id } });
}

async function addGroup() {
  await router.push({ name: 'group', params: { id: 'new' } });
}
</script>
