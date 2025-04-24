import { defineStore, acceptHMRUpdate } from 'pinia';
import { apiRequest } from 'src/components/aux_functions';
import type {
  NodeSchduleRequest,
  Task,
  TaskResponse,
  UsagePeriod,
} from 'src/components/db_models';

const taskBasePath = '/task';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: <TaskResponse[]>[],
    resourceSchedule: <UsagePeriod[]>[],
  }),
  getters: {
    getTasks: (state) => state.tasks,
    getResourceSchedule: (state) => state.resourceSchedule,
  },
  actions: {
    async fetchTasks(): Promise<void> {
      this.tasks = await apiRequest<Task[], TaskResponse[]>(
        taskBasePath,
        'Failed to fetch tasks!',
        'get',
      );
    },
    async createOrUpdateTask(task: Task): Promise<TaskResponse> {
      const data = await apiRequest<Task, TaskResponse>(
        taskBasePath,
        'Failed to create task!',
        'post',
        task,
      );
      if (task.id) {
        for (let i = 0; i < this.tasks.length; i++) {
          if (this.tasks[i]?.id === task.id) {
            this.tasks[i] = data;
            break;
          }
        }
      } else {
        this.tasks.push(data);
      }
      return data;
    },
    async deleteTask(task_id: number): Promise<void> {
      await apiRequest<void, void>(
        `${taskBasePath}/${task_id}`,
        'Failed to delete task!',
        'delete',
      );
      this.tasks = this.tasks.filter((t) => t.id !== task_id);
    },
    async getTaskData(task_id: number): Promise<TaskResponse> {
      const data = await apiRequest<Task, TaskResponse>(
        `${taskBasePath}/${task_id}`,
        'Failed to get task data!',
        'get',
      );
      for (let i = 0; i < this.tasks.length; i++) {
        if (this.tasks[i]?.id === task_id) {
          this.tasks[i] = data;
          break;
        }
      }
      return data;
    },
    async fetchResourceSchedule(
      start_time: string,
      end_time: string,
    ): Promise<void> {
      this.resourceSchedule = await apiRequest<
        NodeSchduleRequest,
        UsagePeriod[]
      >(
        `${taskBasePath}/get_scheduling`,
        'Failed to get resource schedule!',
        'post',
        {
          start_time,
          end_time,
        },
      );
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
