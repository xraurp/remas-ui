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
import { type User } from 'src/components/db_models';
import UserItem from 'src/components/UserItem.vue';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const userGroupStore = useUserGroupStore();
const router = useRouter();
const users = computed(() => userGroupStore.getUsers);
onMounted(async () => {
  await userGroupStore.fetchUsers();
  await userGroupStore.fetchGroups();
});
async function editFunction(user: User) {
  await router.push({ name: 'user', params: { id: user.id } });
}

async function addUser() {
  await router.push({ name: 'user', params: { id: 'new' } });
}
</script>
