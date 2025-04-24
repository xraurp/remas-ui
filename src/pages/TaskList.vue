<template>
  <q-page padding>
    <div class="text-h3">Tasks</div>
    <q-separator class="q-mb-md" />
    <q-btn color="green" label="Add task" @click="addTask" />
    <div class="q-pa-md row items-start q-gutter-md">
      <template v-for="item in tasks">
        <task-item
          v-if="item?.id"
          :key="item.id"
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
      </template>
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

const router = useRouter();
const taskStore = useTaskStore();
const $q = useQuasar();

const tasks = computed(() => taskStore.tasks);

onMounted(async () => {
  try {
    if (!taskStore.getTasks.length) {
      await taskStore.fetchTasks();
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
});

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
</script>
