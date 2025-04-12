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
          :edit-function="editFunction"
          :delete-function="userGroupStore.deleteUser"
          style="min-height: 200px; min-width: 400px"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getMessageFromError } from 'src/components/aux_functions';
import { type User } from 'src/components/db_models';
import UserItem from 'src/components/UserItem.vue';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const userGroupStore = useUserGroupStore();
const router = useRouter();
const $q = useQuasar();
const users = computed(() => userGroupStore.getUsers);

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
async function editFunction(user: User) {
  await router.push({ name: 'user', params: { id: user.id } });
}

async function addUser() {
  await router.push({ name: 'user', params: { id: 'new' } });
}
</script>
