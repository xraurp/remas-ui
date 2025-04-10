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
          <q-input
            outlined
            v-model="password"
            :type="showPasswd ? 'text' : 'password'"
            label="Password"
            :rules="[(val) => !!val || 'Password is required']"
            class="col"
            :disable="readOnly"
          >
            <template v-slot:append>
              <q-icon
                :name="showPasswd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPasswd = !showPasswd"
                :disable="readOnly"
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
            :disable="readOnly"
          />
          <q-input
            outlined
            v-model="userEdit.uid"
            label="UID used on nodes"
            :rules="[(val) => !!val || 'UID is required']"
            class="col"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" style="padding-bottom: 25px">
          <q-select
            outlined
            v-model="selectedGroupName"
            :options="options"
            label="Select user group"
            class="col"
            :disable="readOnly"
          />
        </div>
        <div class="row q-gutter-sm" v-if="!readOnly">
          <q-btn
            label="Create user"
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
    <!-- TODO - add notification and limit list and editor -->
    <!-- TODO - add 'add' button with validation -->
  </div>
</template>

<script setup lang="ts">
import type { User, Group } from 'src/components/db_models';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserGroupStore } from 'src/stores/user-group-store';

const props = defineProps<{
  user_id?: number;
  createNew: boolean;
}>();

const userGroupStore = useUserGroupStore();
const router = useRouter();
const $q = useQuasar();

onMounted(async () => {
  if (!userGroupStore.users.length) {
    await userGroupStore.fetchUsers();
  }
  if (!userGroupStore.groups.length) {
    await userGroupStore.fetchGroups();
  }
});

const groups: Group[] = userGroupStore.getGroups;

let user: User | undefined = undefined;
if (props.user_id) {
  user = userGroupStore.getUserById(props.user_id);
}
let createNew = props.createNew;

/**
 * Returns the name of the group that the user belongs to,
 * or 'Users' if the group ID is not found.
 * @returns The name of the group that the user belongs to.
 */
function getDefaultSelectedGroup() {
  return groups.find((group) => group.id === user?.group?.id)?.name || 'Users';
}

const readOnly = ref(!createNew);
const selectedGroupName = ref(getDefaultSelectedGroup());
const showPasswd = ref(false);

const options = computed(() => {
  return Array.from(groups.values()).map((group) => group.name);
});

const password = ref('');
const userEdit = ref<User>({
  name: '',
  surname: '',
  uid: 0,
  username: '',
  email: '',
  group_id: 3,
});

if (user) {
  userEdit.value = user;
}

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
  if (createNew) {
    router.back();
  } else {
    readOnly.value = true;
    if (user) {
      userEdit.value = user;
    } else {
      userEdit.value = {
        name: '',
        surname: '',
        uid: 0,
        username: '',
        email: '',
        group_id: 3,
      };
    }
  }
}

function onEdit() {
  readOnly.value = false;
}

function onSubmit() {
  assignGroupIdToUser(selectedGroupName.value);
  readOnly.value = true;

  if (createNew) {
    const userWPasswd = {
      ...userEdit.value,
      password: password.value,
    };

    userGroupStore
      .createUser(userWPasswd)
      .then((newUser) => {
        if (process.env.debug) {
          console.log(newUser);
        }
        $q.notify({
          type: 'positive',
          message: 'User created successfully!',
        });
        createNew = false;
        user = newUser;
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
  // update existing user
  else {
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
        createNew = false;
        user = newUser;
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
}
</script>
