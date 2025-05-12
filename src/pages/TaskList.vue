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

async function loadMore() {
  try {
    if (props.all_tasks) {
      await taskStore.fetchTasks(pageNumber.value);
    } else {
      await taskStore.fetchTasks(pageNumber.value, authStore.getUserId);
    }
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
  if (process.env.debug) {
    console.log(pageNumber.value);
  }
}

async function loadFinished() {
  try {
    if (props.all_tasks) {
      await taskStore.fetchFinishedTasks(finishedPageNumber.value);
    } else {
      await taskStore.fetchFinishedTasks(
        finishedPageNumber.value,
        authStore.getUserId,
      );
    }
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
  if (process.env.debug) {
    console.log(finishedPageNumber.value);
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
  await loadMore();
});
</script>
