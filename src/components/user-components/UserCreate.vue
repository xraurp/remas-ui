<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="row q-gutter-sm" style="padding-bottom: 25px">
          <q-input outlined v-model="userEdit.name" label="Name" class="col" />
          <q-input
            outlined
            v-model="userEdit.surname"
            label="Surname"
            class="col"
          />
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="userEdit.email"
            label="Email"
            :rules="[(val) => !!val || 'Email is required']"
            class="col"
          />
          <q-input
            outlined
            v-model="userEdit.password"
            :type="showPasswd ? 'text' : 'password'"
            label="Password"
            :rules="[(val) => !!val || 'Password is required']"
            class="col"
          >
            <template v-slot:append>
              <q-icon
                :name="showPasswd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPasswd = !showPasswd"
              />
            </template>
          </q-input>
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="userEdit.username"
            label="Username used on nodes"
            :rules="[(val) => !!val || 'Username is required']"
            class="col"
          />
          <q-input
            outlined
            v-model="uid"
            label="UID used on nodes"
            :rules="[(val) => !!val || 'UID is required']"
            class="col"
          />
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 25px">
          <q-select
            outlined
            v-model="selectedGroupName"
            :options="options"
            label="Select user group"
            class="col"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            label="Create user"
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
import type { Group, UserWithPassword } from 'src/components/db_models';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { getMessageFromError } from '../aux_functions';

const userGroupStore = useUserGroupStore();
const router = useRouter();
const $q = useQuasar();

onMounted(async () => {
  try {
    if (!userGroupStore.getUsers.length) {
      await userGroupStore.fetchUsers();
    }
    if (!userGroupStore.getGroups.length) {
      await userGroupStore.fetchGroups();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    const message = getMessageFromError(
      error,
      'Failed to fetch users and groups!',
    );
    $q.notify({
      type: 'negative',
      message: message,
    });
  }
});

const groups: Group[] = userGroupStore.getGroups;
const selectedGroupName = ref('Users');
const showPasswd = ref(false);

// list of options for select group dropdown
const options = computed(() => {
  return Array.from(groups.values()).map((group) => group.name);
});

const uid = ref(undefined);

const userEdit = ref<UserWithPassword>({
  name: '',
  surname: '',
  uid: 0,
  username: '',
  email: '',
  group_id: 3,
  password: '',
});

/**
 * Assignes the group ID according to the group name selected by the user.
 * If the group name is not found, it defaults to "Users".
 * @param name The name of the group
 */
function assignGroupIdToUser(name: string) {
  const group_id = groups.find((group) => group.name === name)?.id;
  if (group_id) {
    userEdit.value.group_id = group_id;
  } else {
    userEdit.value.group_id = 3;
  }
}

/**
 * Resets the form to its initial state
 */
function onCancel() {
  router.back();
}

function onSubmit() {
  assignGroupIdToUser(selectedGroupName.value);

  if (uid.value) {
    userEdit.value.uid = parseInt(uid.value);
    if (isNaN(userEdit.value.uid)) {
      $q.notify({
        type: 'negative',
        message: 'UID must be a number',
      });
      return;
    }
  } else {
    $q.notify({
      type: 'negative',
      message: 'UID is required',
    });
    return;
  }

  userGroupStore
    .createUser(userEdit.value)
    .then(async (newUser) => {
      if (process.env.debug) {
        console.log(newUser);
      }
      $q.notify({
        type: 'positive',
        message: 'User created successfully!',
      });
      await router.replace({ name: 'user', params: { id: newUser.id } });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(error, 'Failed to create user!'),
      });
    });
}
</script>
