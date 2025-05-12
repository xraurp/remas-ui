<template>
  <q-page padding>
    <div class="text-h3">Users</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add user" @click="addUser" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="user in users">
        <user-item
          v-if="user?.id"
          :key="user.id"
          :user="user"
          style="min-height: 200px; min-width: 400px"
        >
          <template v-slot:actions>
            <q-btn flat color="primary" @click="editFunction(user)">Edit</q-btn>
            <q-btn flat color="negative" @click="openConfirmDialog(user)"
              >Delete</q-btn
            >
          </template>
        </user-item>
      </template>
    </div>
  </q-page>
  <q-dialog v-model="showRemoveDialog" persistent>
    <ConfirmRemoveDialog @confirm="deleteUser()">
      <template v-slot:message>
        Are you sure you want to remove this user?
      </template>
    </ConfirmRemoveDialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { type User } from 'src/components/db_models';
import UserItem from 'src/components/user-components/UserItem.vue';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ConfirmRemoveDialog from '../components/ConfirmRemoveDialog.vue';
import { ref } from 'vue';

const userGroupStore = useUserGroupStore();
const router = useRouter();
const $q = useQuasar();
const users = computed(() => userGroupStore.getUsers);

const selectedUser = ref<User | null>(null);
const showRemoveDialog = ref(false);

onMounted(async () => {
  try {
    await userGroupStore.fetchUsers();
    await userGroupStore.fetchGroups();
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      color: 'negative',
      message: getMessageFromError(error, 'Failed to fetch users!'),
    });
  }
});

function openConfirmDialog(user: User) {
  selectedUser.value = user;
  showRemoveDialog.value = true;
}

async function editFunction(user: User) {
  await router.push({ name: 'user', params: { id: user.id } });
}

async function addUser() {
  await router.push({ name: 'user', params: { id: 'new' } });
}

async function deleteUser() {
  try {
    await userGroupStore.deleteUser(selectedUser.value!);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete user!'),
    });
  }
  showRemoveDialog.value = false;
}
</script>
