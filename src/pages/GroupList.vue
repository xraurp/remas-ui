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
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn flat color="primary" @click="editFunction(group)"
              >Edit</q-btn
            >
            <q-btn flat color="negative" @click="openConfirmDialog(group)"
              >Delete</q-btn
            >
          </template>
        </group-item>
      </template>
    </div>
  </q-page>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="deleteGroup()">
      <template v-slot:message>
        Are you sure you want to remove this group?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { type Group } from 'src/components/db_models';
import GroupItem from 'src/components/group-components/GroupItem.vue';
import ConfirmRemoveDialog from 'src/components/ConfirmRemoveDialog.vue';
import { ref } from 'vue';

const router = useRouter();
const userGroupStore = useUserGroupStore();
const $q = useQuasar();
const groups = computed(() => userGroupStore.getGroups);

const showRemoveDialog = ref(false);
const selectedGroup = ref<Group | null>(null);

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

function openConfirmDialog(group: Group) {
  selectedGroup.value = group;
  showRemoveDialog.value = true;
}

async function deleteGroup() {
  try {
    await userGroupStore.deleteGroup(selectedGroup.value!);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete group!'),
    });
  }
  showRemoveDialog.value = false;
}

async function editFunction(group: Group) {
  await router.push({ name: 'group', params: { id: group.id } });
}

async function addGroup() {
  await router.push({ name: 'group', params: { id: 'new' } });
}
</script>
