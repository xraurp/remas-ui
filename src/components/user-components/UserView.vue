<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 600px">
      <q-form @reset="onCancel" @submit="onSubmit">
        <div class="row q-gutter-sm" style="padding-bottom: 25px">
          <q-input
            outlined
            v-model="userEdit.name"
            label="Name"
            class="col"
            :disable="readOnly"
          />
          <q-input
            outlined
            v-model="userEdit.surname"
            label="Surname"
            class="col"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="userEdit.email"
            label="Email"
            :rules="[(val) => !!val || 'Email is required']"
            class="col"
            :disable="readOnly"
          />
          <div class="col"></div>
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 5px">
          <q-input
            outlined
            v-model="userEdit.username"
            label="Username used on nodes"
            :rules="[(val) => !!val || 'Username is required']"
            class="col"
            :disable="true"
          />
          <q-input
            outlined
            v-model="uid"
            label="UID used on nodes"
            :rules="[(val) => !!val || 'UID is required']"
            class="col"
            :disable="readOnly || isProfile"
          />
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 25px">
          <q-select
            outlined
            v-model="selectedGroupName"
            :options="options"
            label="Select user group"
            class="col"
            :disable="readOnly || isProfile"
          >
            <template #after-options></template>
          </q-select>
        </div>
        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Update user"
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
      <div>
        <div class="row q-gutter-sm" v-if="showChangePassword">
          <UserChangePassword
            :user="userEdit"
            @closePasswordDialog="showChangePassword = false"
            :setPasswd="!isProfile"
          />
        </div>
        <div class="row q-gutter-sm" v-if="!showChangePassword">
          <q-btn
            label="Change password"
            color="primary"
            class="col"
            @click="showChangePassword = true"
          />
          <div class="col"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Group } from 'src/components/db_models';
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { getMessageFromError } from '../aux_functions';
import UserChangePassword from './UserChangePassword.vue';

const props = defineProps<{
  user_id?: number;
  is_profile?: boolean;
}>();

const userGroupStore = useUserGroupStore();
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

let user: User | undefined = undefined;
if (props.user_id) {
  user = userGroupStore.getUserById(props.user_id);
}
const isProfile = props.is_profile || false;

/**
 * Returns the name of the group that the user belongs to,
 * or 'Users' if the group ID is not found.
 * @returns The name of the group that the user belongs to.
 */
function getDefaultSelectedGroup() {
  return groups.find((group) => group.id === user?.group?.id)?.name || 'Users';
}

/**
 * Creates a copy of the user object.
 * @param user The user object to copy.
 * @returns A new user object.
 */
function copyUser(user?: User) {
  return <User>{
    id: user?.id || undefined,
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    username: user?.username || '',
    uid: user?.uid || 0,
    group_id: user?.group?.id || 3,
  };
}

function compareUsers(user1?: User, user2?: User) {
  let cmp = user1?.id === user2?.id;
  cmp = cmp && user1?.name === user2?.name;
  cmp = cmp && user1?.surname === user2?.surname;
  cmp = cmp && user1?.email === user2?.email;
  cmp = cmp && user1?.username === user2?.username;
  cmp = cmp && user1?.uid === user2?.uid;
  return cmp;
}

const readOnly = ref(true);
const selectedGroupName = ref(getDefaultSelectedGroup());
const changeGroup = ref(false);
const showChangePassword = ref(false);

// list of options for select group dropdown
const options = computed(() => {
  return Array.from(groups.values()).map((group) => group.name);
});

const userEdit = ref<User>(copyUser(user));
const uid = ref(user?.uid?.toString() || '');

/**
 * Returns the group object for the selected group name.
 * @param name The name of the group
 * @returns The group object for the selected group name.
 */
function getNewGroup(name: string) {
  const group = groups.find((group) => group.name === name);
  // check if group stays the same
  if (userEdit.value.group_id === group?.id) {
    return undefined;
  }

  return group;
}

/**
 * Change user group.
 * @param group The group object
 */
function changeUserGroup(group?: Group) {
  if (!group) {
    return;
  }
  // assign new group to user (or default to "Users")
  userEdit.value.group_id = group?.id || 3;

  // add user to group
  userGroupStore
    .addUserToGroup(userEdit.value, group)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'User added to group successfully!',
      });
      readOnly.value = true;
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(error, 'Failed to change user group!'),
      });
    });
}

/**
 * Update user data.
 */
function updateUserData() {
  if (
    compareUsers(userEdit.value, user) &&
    uid.value === user?.uid?.toString()
  ) {
    return;
  }

  if (uid.value) {
    userEdit.value.uid = parseInt(uid.value);
    if (isNaN(userEdit.value.uid)) {
      throw new Error('UID must be a number!');
    }
  } else {
    throw new Error('UID is required!');
  }

  userGroupStore
    .updateUser(userEdit.value)
    .then((newUser) => {
      if (process.env.debug) {
        console.log(newUser);
      }
      $q.notify({
        type: 'positive',
        message: 'User updated successfully!',
      });
      user = newUser;
      userEdit.value = copyUser(newUser);
      readOnly.value = true;
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: error.message,
      });
    });
}

/**
 * Resets the form to its initial state
 */
function onCancel() {
  readOnly.value = true;
  changeGroup.value = false;
  userEdit.value = copyUser(user);
  uid.value = user?.uid?.toString() || '';
}

function onEdit() {
  readOnly.value = false;
}

function onSubmit() {
  const newGroup = getNewGroup(selectedGroupName.value);
  if (
    !newGroup &&
    compareUsers(userEdit.value, user) &&
    uid.value === user?.uid?.toString()
  ) {
    $q.notify({
      type: 'info',
      color: 'primary',
      message: 'No changes detected.',
    });
    readOnly.value = true;
    return;
  }
  changeUserGroup(newGroup);
  try {
    updateUserData();
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to update user!'),
    });
    return;
  }
}
</script>
