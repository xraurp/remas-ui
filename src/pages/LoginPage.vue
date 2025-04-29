<template>
  <q-page padding class="row">
    <div class="col"></div>
    <div
      class="q-pa-md col iems-center"
      style="max-width: 45em; min-width: 30em"
    >
      <q-card bordered>
        <q-card-section>
          <div class="text-h5">Login to REMAS</div>
          <!--div class="text-subtitle2">Subtitle</div-->
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <q-form @submit="authenticate">
            <q-input
              outlined
              v-model="username"
              label="Username"
              :rules="[(val) => !!val || 'Username is required']"
              style="margin-bottom: 10px"
              class="row"
            />
            <q-input
              outlined
              v-model="password"
              :type="showPasswd ? 'text' : 'password'"
              label="Password"
              :rules="[(val) => !!val || 'Password is required']"
              style="margin-bottom: 10px"
              class="row"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPasswd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPasswd = !showPasswd"
                />
              </template>
            </q-input>
            <div class="row">
              <q-btn label="Login" color="primary" class="col" type="submit" />
            </div>
            <div class="row text-negative" style="margin-top: 10px">
              {{ error_msg }}
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
    <div class="col"></div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
const showPasswd = ref(false);
const error_msg = ref('');
const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');

function authenticate() {
  const formdata = new FormData();
  formdata.append('username', username.value);
  formdata.append('password', password.value);

  api
    .post('/authentication/token', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(async (response) => {
      if (process.env.debug) {
        console.log(response);
      }
      authStore.setTokens(
        response.data.access_token,
        response.data.refresh_token,
      );
      await authStore.fetchUser().catch((err) => {
        console.log(err);
        error_msg.value = err.message;
      });
      router.push({ path: '/' }).catch((err) => {
        console.log(err);
        error_msg.value = err.message;
      });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      if (error.response) {
        error_msg.value = error.response.data.detail;
      } else {
        error_msg.value = error.message;
      }
    });
}
</script>
