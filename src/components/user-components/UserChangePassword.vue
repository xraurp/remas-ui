<template>
  <div style="width: 100%">
    <q-form @submit="onSubmit" @reset="onCancel">
      <div class="row q-gutter-sm" style="padding-bottom: 5px">
        <q-input
          outlined
          v-model="newPassword"
          :type="showNewPasswd ? 'text' : 'password'"
          label="New password"
          :rules="[(val) => !!val || 'Password is required']"
          class="col"
        >
          <template v-slot:append>
            <q-icon
              :name="showNewPasswd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showNewPasswd = !showNewPasswd"
            />
          </template>
        </q-input>
        <q-input
          outlined
          v-model="newPassword2"
          :type="showNewPasswd ? 'text' : 'password'"
          label="Confirm new password"
          :rules="[(val) => !!val || 'Password is required']"
          class="col"
        >
          <template v-slot:append>
            <q-icon
              :name="showNewPasswd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showNewPasswd = !showNewPasswd"
            />
          </template>
        </q-input>
      </div>
      <div
        v-if="!props.setPasswd"
        class="row q-gutter-sm"
        style="padding-bottom: 5px"
      >
        <q-input
          outlined
          v-model="password"
          :type="showPasswd ? 'text' : 'password'"
          label="Enter current password"
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
        <div class="col"></div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          label="Change password"
          type="submit"
          color="primary"
          class="col"
        />
        <q-btn label="Cancel" type="reset" color="primary" flat class="col" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type User } from '../db_models';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useQuasar } from 'quasar';
import { getMessageFromError } from '../aux_functions';

const props = defineProps<{
  user: User;
  setPasswd: boolean;
}>();

const emit = defineEmits(['closePasswordDialog']);

const userGroupStore = useUserGroupStore();
const authStore = useAuthStore();
const $q = useQuasar();

const password = ref('');
const newPassword = ref('');
const newPassword2 = ref('');
const showPasswd = ref(false);
const showNewPasswd = ref(false);

function setPassword() {
  if (process.env.debug) {
    console.log(props.user);
  }
  userGroupStore
    .setUserPassword(props.user, newPassword.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Password changed successfully!',
      });
      emit('closePasswordDialog');
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(error, 'Failed to change password!'),
      });
    });
}

function changePassword() {
  authStore
    .updateUserPassword(newPassword.value, password.value)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Password changed successfully!',
      });
      emit('closePasswordDialog');
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      $q.notify({
        type: 'negative',
        message: getMessageFromError(error, 'Failed to change password!'),
      });
    });
}

function onCancel() {
  password.value = '';
  newPassword.value = '';
  newPassword2.value = '';
  emit('closePasswordDialog');
}

function onSubmit() {
  if (newPassword.value !== newPassword2.value) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match',
    });
    return;
  }
  if (props.setPasswd) {
    setPassword();
  } else {
    changePassword();
  }
}
</script>
