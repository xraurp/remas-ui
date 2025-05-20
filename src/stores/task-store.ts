import { defineStore, acceptHMRUpdate } from 'pinia';
import { apiRequest } from 'src/components/aux_functions';
import type {
  NodeSchduleRequest,
  Task,
  TaskResponse,
  UsagePeriod,
} from 'src/components/db_models';
import { dateFormat, formatDatetime } from 'src/components/calendarDateFormat';
import { date } from 'quasar';

const taskBasePath = '/task';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: <TaskResponse[]>[],
    finishedTasks: <TaskResponse[]>[],
    allTasks: <TaskResponse[]>[],
    allFinishedTasks: <TaskResponse[]>[],
    resourceSchedule: <UsagePeriod[]>[],
    pageSize: 10,
    // data related to task scheduler calendar integration
    selectedTask: 0,
    previousStart: '',
    previousEnd: '',
    previousTask: 0,
  }),
  getters: {
    getTasks: (state) => state.tasks,
    getFinishedTasks: (state) => state.finishedTasks,
    getAllTasks: (state) => state.allTasks,
    getAllFinishedTasks: (state) => state.allFinishedTasks,
    getResourceSchedule: (state) => state.resourceSchedule,
    getPageSize: (state) => state.pageSize,
    getSelectedTask: (state) => state.selectedTask,
    getPreviousStart: (state) => state.previousStart,
    getPreviousEnd: (state) => state.previousEnd,
    getPreviousTask: (state) => state.previousTask,
  },
  actions: {
    setSelectedTask(task_id: number): void {
      this.selectedTask = task_id;
    },
    setPreviousCalendarRange(
      start: string,
      end: string,
      task_id: number,
    ): void {
      this.previousStart = start;
      this.previousEnd = end;
      this.previousTask = task_id;
    },
    async fetchTasks(page_number: number, user_id?: number): Promise<void> {
      const path = user_id ? `/user/${user_id}/active` : '/active';
      const data = await apiRequest<
        { page_number: number; page_size: number },
        TaskResponse[]
      >(`${taskBasePath}${path}`, 'Failed to fetch tasks!', 'post', {
        page_number: page_number,
        page_size: this.pageSize,
      });
      if (user_id) {
        for (const task of data) {
          const t = this.tasks.find((t) => t.id === task.id);
          if (!t) {
            this.tasks.push(task);
          } else {
            this.tasks[this.tasks.indexOf(t)] = task;
          }
        }
      } else {
        for (const task of data) {
          const t = this.allTasks.find((t) => t.id === task.id);
          if (!t) {
            this.allTasks.push(task);
          } else {
            this.allTasks[this.allTasks.indexOf(t)] = task;
          }
        }
      }
    },
    async fetchFinishedTasks(
      page_number: number,
      user_id?: number,
    ): Promise<void> {
      const path = user_id ? `/user/${user_id}/finished` : '/finished';
      const data = await apiRequest<
        { page_number: number; page_size: number },
        TaskResponse[]
      >(`${taskBasePath}${path}`, 'Failed to fetch tasks!', 'post', {
        page_number,
        page_size: this.pageSize,
      });
      if (user_id) {
        for (const task of data) {
          const t = this.finishedTasks.find((t) => t.id === task.id);
          if (!t) {
            this.finishedTasks.push(task);
          } else {
            this.finishedTasks[this.finishedTasks.indexOf(t)] = task;
          }
        }
      } else {
        for (const task of data) {
          const t = this.allFinishedTasks.find((t) => t.id === task.id);
          if (!t) {
            this.allFinishedTasks.push(task);
          } else {
            this.allFinishedTasks[this.allFinishedTasks.indexOf(t)] = task;
          }
        }
      }
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
      exclude_task_id: number,
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
          exclude_task_id,
        },
      );
    },
    /**
     * Removes tasks that have already finished from the task list.
     */
    removeFinishedTasks() {
      const current_time = new Date();
      this.tasks = this.tasks.filter((t) => {
        const end_time = date.extractDate(
          formatDatetime(t.end_time),
          dateFormat,
        );
        const diff = date.getDateDiff(end_time, current_time, 'minutes');
        return diff > 0;
      });
    },
    /**
     * Removes tasks that have already finished from the tasks list
     * on page that show all tasks.
     */
    removeFinishedTasksFromAll() {
      const current_time = new Date();
      this.allTasks = this.allTasks.filter((t) => {
        const end_time = date.extractDate(
          formatDatetime(t.end_time),
          dateFormat,
        );
        const diff = date.getDateDiff(end_time, current_time, 'minutes');
        return diff > 0;
      });
    },
    logout() {
      this.tasks = [];
      this.finishedTasks = [];
      this.allTasks = [];
      this.allFinishedTasks = [];
      this.resourceSchedule = [];
      this.selectedTask = 0;
      this.previousStart = '';
      this.previousEnd = '';
      this.previousTask = 0;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot));
}
