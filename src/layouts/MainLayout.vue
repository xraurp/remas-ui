<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> REMAS </q-toolbar-title>
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
          <template v-if="!drawerItem.adminOnly || authStore.isAdmin">
            <q-item-label v-if="drawerItem.label" header>{{
              drawerItem.label
            }}</q-item-label>
            <q-separator v-if="drawerItem.label" />
            <template v-for="item in drawerItem.pages" :key="item.label">
              <template v-if="!item.adminOnly || authStore.isAdmin">
                <q-item
                  v-if="'link' in item"
                  clickable
                  :to="{ name: item.link }"
                >
                  <q-item-section>
                    <q-item-label style="text-align: center">{{
                      item.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-else clickable @click="item.action">
                  <q-item-section>
                    <q-item-label style="text-align: center">{{
                      item.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </template>
          </template>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="router.currentRoute.value.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useLimitStore } from 'src/stores/limit-store';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useTaskStore } from 'src/stores/task-store';
import { useUserGroupStore } from 'src/stores/user-group-store';
import { getFirstLetter } from 'src/components/aux_functions';
import { useRouter } from 'vue-router';
import { apiRequest } from 'src/components/aux_functions';

//import { pageNavigationCategory, pageNavigationItem } from 'components/models';
const authStore = useAuthStore();
const limitStore = useLimitStore();
const nodeResourceStore = useNodeResourceStore();
const notificationStore = useNotificationStore();
const taskStore = useTaskStore();
const userGroupStore = useUserGroupStore();
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
        adminOnly: false,
      },
    ],
  },
  {
    label: 'Status',
    adminOnly: false,
    pages: [
      {
        label: 'Cluster status',
        action: openGrafanalink,
        adminOnly: false,
      },
      {
        label: 'All tasks',
        link: 'all-tasks',
        adminOnly: false,
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
        adminOnly: true,
      },
      {
        label: 'Groups',
        link: 'groups',
        adminOnly: true,
      },
      {
        label: 'Nodes',
        link: 'nodes',
        adminOnly: true,
      },
      {
        label: 'Resources',
        link: 'resources',
        adminOnly: true,
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
        adminOnly: false,
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

async function openGrafanalink() {
  const data = await apiRequest<string, { detail: string }>(
    '/grafana-link',
    'Failed to get grafana link!',
    'get',
  );
  window.open(data.detail, '_blank');
}

async function onLogout() {
  limitStore.logout();
  nodeResourceStore.logout();
  notificationStore.logout();
  taskStore.logout();
  userGroupStore.logout();
  authStore.logout();
  await router.push({ name: 'login' });
}

async function onProfile() {
  await router.push({ name: 'profile' });
}
</script>
