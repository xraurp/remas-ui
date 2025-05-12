<template>
  <q-page padding>
    <div class="text-h3">Tasks</div>
    <q-separator class="q-mb-md" />
    <q-btn
      color="green"
      label="Add task"
      @click="addTask"
      v-if="!props.all_tasks"
    />
    <div class="q-pa-md row items-start q-gutter-md">
      <task-item
        v-for="item in tasks"
        :key="item.id!"
        :task="item"
        :show_owner="false"
        style="min-height: 200px; min-width: 400px"
      >
        <template v-slot:actions v-if="!props.all_tasks">
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
import { ref } from 'vue';

const props = defineProps<{
  all_tasks: boolean | undefined;
}>();

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const $q = useQuasar();

const tasks = computed(() => {
  if (props.all_tasks) {
    return taskStore.getAllTasks;
  } else {
    return taskStore.getTasks;
  }
});
const finishedTasks = computed(() => {
  if (props.all_tasks) {
    return taskStore.getAllFinishedTasks;
  } else {
    return taskStore.getFinishedTasks;
  }
});
const pageNumber = ref(0);
const finishedPageNumber = ref(0);

async function loadPage(page: number) {
  if (props.all_tasks) {
    await taskStore.fetchTasks(page);
  } else {
    await taskStore.fetchTasks(page, authStore.getUserId);
  }
}

async function loadFinishedPage(page: number) {
  if (props.all_tasks) {
    await taskStore.fetchFinishedTasks(page);
  } else {
    await taskStore.fetchFinishedTasks(page, authStore.getUserId);
  }
}

async function loadMore() {
  try {
    await loadPage(pageNumber.value);
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
  if (tasks.value.length > taskStore.pageSize * pageNumber.value) {
    pageNumber.value++;
  }
}

async function loadFinished() {
  try {
    await loadFinishedPage(finishedPageNumber.value);
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
  if (
    finishedTasks.value.length >
    taskStore.pageSize * finishedPageNumber.value
  ) {
    finishedPageNumber.value++;
  }
}

async function refresh() {
  try {
    for (let i = 0; i < pageNumber.value; i++) {
      await loadPage(i);
    }
    for (let i = 0; i < finishedPageNumber.value; i++) {
      await loadFinishedPage(i);
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch tasks!'),
    });
  }
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
  if (props.all_tasks) {
    taskStore.removeFinishedTasksFromAll();
  } else {
    taskStore.removeFinishedTasks();
  }
  pageNumber.value = Math.ceil(tasks.value.length / taskStore.pageSize);
  finishedPageNumber.value = Math.ceil(
    finishedTasks.value.length / taskStore.pageSize,
  );
  if (pageNumber.value === 0 && finishedPageNumber.value === 0) {
    await loadMore();
  } else {
    await refresh();
  }
  console.log(pageNumber.value);
  console.log(finishedPageNumber.value);
});
</script>
