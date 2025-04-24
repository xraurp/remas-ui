<template>
  <q-page padding>
    <div class="text-h3">Tasks</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add task" @click="addTask" />
    <div class="q-pa-md row items-start q-gutter-md">
      <task-item
        v-for="item in tasks"
        :key="item.id!"
        :task="item"
        :show_owner="false"
        style="min-height: 200px; min-width: 400px"
      >
        <template v-slot:actions>
          <q-btn flat color="primary" @click="editTask(item)">
            Reschedule task
          </q-btn>
          <q-btn flat color="negative" @click="deleteTask(item)">
            Cancel task
          </q-btn>
        </template>
      </task-item>
    </div>
    <div style="padding-bottom: 25px">
      <q-btn color="primary" label="Load more" @click="loadMore" />
    </div>
    <div class="text-h5">Finished tasks</div>
    <q-separator class="q-mb-md" />
    <div class="q-pa-md row items-start q-gutter-md">
      <task-item
        v-for="item in finishedTasks"
        :key="item.id!"
        :task="item"
        :show_owner="false"
        style="min-height: 200px; min-width: 400px"
      />
    </div>
    <div>
      <q-btn color="primary" label="Load more" @click="loadFinished" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import TaskItem from 'src/components/task-components/TaskItem.vue';
import type { Task } from 'src/components/db_models';
import { useTaskStore } from 'src/stores/task-store';
import { getMessageFromError } from 'src/components/aux_functions';
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const $q = useQuasar();

const tasks = computed(() => taskStore.getTasks);
const finishedTasks = computed(() => taskStore.getFinishedTasks);
let pageNumber = 0;
let finishedPageNumber = 0;

async function loadMore() {
  try {
    await taskStore.fetchTasks(pageNumber, authStore.getUserId);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch tasks!'),
    });
    return;
  }
  pageNumber++;
}

async function loadFinished() {
  try {
    await taskStore.fetchFinishedTasks(finishedPageNumber, authStore.getUserId);
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch tasks!'),
    });
    return;
  }
  finishedPageNumber++;
}

async function addTask() {
  await router.push({ name: 'task', params: { id: 'new' } });
}

async function editTask(task: Task) {
  await router.push({ name: 'task', params: { id: task.id } });
}

async function deleteTask(task: Task) {
  try {
    if (task.id) {
      await taskStore.deleteTask(task.id);
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to delete task!'),
    });
  }
}

onMounted(async () => {
  await loadMore();
});
</script>
