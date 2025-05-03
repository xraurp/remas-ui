<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <!-- TODO - change icon to some created one -->
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          REMAS
        </q-toolbar-title>
        <!-- TODO - add avatar with user settings -->

        <q-btn-dropdown flat rounded dense color="primary">
          <template v-slot:label>
            <q-avatar color="white" text-color="primary">{{
              firstLetter
            }}</q-avatar>
          </template>
          <q-list>
            <q-item clickable v-close-popup @click="onProfile">
              <q-item-section>
                <q-item-label>User profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="onLogout">
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <template
          v-for="drawerItem in leftDrawerContent"
          :key="drawerItem.label"
        >
          <q-item-label v-if="drawerItem.label" header>{{
            drawerItem.label
          }}</q-item-label>
          <q-separator v-if="drawerItem.label" />
          <q-item
            v-for="item in drawerItem.pages"
            :key="item.label"
            clickable
            :to="{ name: item.link }"
          >
            <q-item-section>
              <q-item-label style="text-align: center">{{
                item.label
              }}</q-item-label>
            </q-item-section>
            <!-- TODO - add link - router action! -->
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { getFirstLetter } from 'src/components/aux_functions';
import { useRouter } from 'vue-router';

//import { pageNavigationCategory, pageNavigationItem } from 'components/models';
const authStore = useAuthStore();
const router = useRouter();

const leftDrawerOpen = ref(false);
const firstLetter = computed(() => getFirstLetter(authStore.user));

const leftDrawerContent = [
  {
    label: 'Task planning',
    adminOnly: false,
    pages: [
      {
        label: 'Tasks',
        link: 'tasks',
      },
    ],
  },
  {
    label: 'Status',
    adminOnly: true,
    pages: [
      {
        label: 'Cluster status',
        link: 'cluster-status',
      },
      {
        label: 'All tasks',
        link: 'all-tasks',
      },
    ],
  },
  {
    label: 'Management',
    adminOnly: true,
    pages: [
      {
        label: 'Users',
        link: 'users',
      },
      {
        label: 'Groups',
        link: 'groups',
      },
      {
        label: 'Nodes',
        link: 'nodes',
      },
      {
        label: 'Resources',
        link: 'resources',
      },
    ],
  },
  {
    label: 'Automation',
    adminOnly: false,
    pages: [
      {
        label: 'Notifications',
        link: 'notifications',
      },
      {
        label: 'Resource limits',
        link: 'limits',
        adminOnly: true,
      },
    ],
  },
];
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function onLogout() {
  authStore.logout();
  await router.push({ name: 'login' });
}

async function onProfile() {
  await router.push({ name: 'profile' });
}
</script>
