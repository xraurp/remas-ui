import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/',
    redirect: { name: 'tasks' },
  },
  {
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
      },
    ],
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: true },
    children: [
      {
        path: '',
        name: 'users',
        component: () => import('pages/UserList.vue'),
        meta: { adminOnly: true },
      },
      {
        path: ':id',
        name: 'user',
        component: () => import('pages/UserPage.vue'),
        meta: { adminOnly: true },
        props: true,
      },
      {
        path: 'new',
        name: 'user-new',
        component: () => import('pages/UserPage.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
  {
    path: '/groups',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: true },
    children: [
      {
        path: '',
        name: 'groups',
        component: () => import('pages/GroupList.vue'),
        meta: { adminOnly: true },
      },
      {
        path: ':id',
        name: 'group',
        component: () => import('pages/GroupPage.vue'),
        meta: { adminOnly: true },
        props: true,
      },
      {
        path: 'new',
        name: 'group-new',
        component: () => import('pages/GroupPage.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
  {
    path: '/nodes',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: true },
    children: [
      {
        path: '',
        name: 'nodes',
        component: () => import('pages/NodeList.vue'),
        meta: { adminOnly: true },
      },
      {
        path: ':id',
        name: 'node',
        component: () => import('pages/NodePage.vue'),
        meta: { adminOnly: true },
        props: true,
      },
      {
        path: 'new',
        name: 'node-new',
        component: () => import('pages/NodePage.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
  {
    path: '/resources',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: true },
    children: [
      {
        path: '',
        name: 'resources',
        component: () => import('pages/ResourceList.vue'),
        meta: { adminOnly: true },
      },
      {
        path: ':id',
        name: 'resource',
        component: () => import('pages/ResourcePage.vue'),
        meta: { adminOnly: true },
        props: true,
      },
      {
        path: 'new',
        name: 'resource-new',
        component: () => import('pages/ResourcePage.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
  {
    path: '/notifications',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: false },
    children: [
      {
        path: '',
        name: 'notifications',
        component: () => import('pages/NotificationList.vue'),
        meta: { adminOnly: false },
      },
      {
        path: ':id',
        name: 'notification',
        component: () => import('pages/NotificationPage.vue'),
        meta: { adminOnly: false },
        props: true,
      },
      {
        path: 'new',
        name: 'notification-new',
        component: () => import('pages/NotificationPage.vue'),
        meta: { adminOnly: false },
      },
    ],
  },
  {
    path: '/limits',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: true },
    children: [
      {
        path: '',
        name: 'limits',
        component: () => import('pages/LimitList.vue'),
        meta: { adminOnly: true },
      },
      {
        path: ':id',
        name: 'limit',
        component: () => import('pages/LimitPage.vue'),
        meta: { adminOnly: true },
        props: true,
      },
      {
        path: 'new',
        name: 'limit-new',
        component: () => import('pages/LimitPage.vue'),
        meta: { adminOnly: true },
      },
    ],
  },
  {
    path: '/tasks',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: false },
    children: [
      {
        path: '',
        name: 'tasks',
        component: () => import('pages/TaskList.vue'),
        meta: { adminOnly: false },
        props: { all_tasks: false },
      },
      {
        path: ':id',
        name: 'task',
        component: () => import('pages/TaskScheduler.vue'),
        meta: { adminOnly: false },
        props: true,
      },
      {
        path: 'new',
        name: 'task-new',
        component: () => import('pages/TaskScheduler.vue'),
        meta: { adminOnly: false },
      },
    ],
  },
  {
    path: '/all-tasks',
    component: () => import('layouts/MainLayout.vue'),
    meta: { adminOnly: false },
    children: [
      {
        path: '',
        name: 'all-tasks',
        component: () => import('pages/TaskList.vue'),
        meta: { adminOnly: false },
        props: { all_tasks: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
