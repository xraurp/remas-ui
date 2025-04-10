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

    <q-footer class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          <div>Title</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
//import { pageNavigationCategory, pageNavigationItem } from 'components/models';

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
        link: 'resource-limits',
        adminOnly: true,
      },
    ],
  },
];

const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
