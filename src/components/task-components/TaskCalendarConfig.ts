import '@schedule-x/theme-default/dist/index.css';
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewWeek,
} from '@schedule-x/calendar';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createResizePlugin } from '@schedule-x/resize';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import { createCurrentTimePlugin } from '@schedule-x/current-time';
import { useTaskStore } from 'src/stores/task-store';
import { dateFormat } from 'src/components/calendarDateFormat';
import { date } from 'quasar';

const dragAndDropPlugin = createDragAndDropPlugin();
const resizePlugin = createResizePlugin(15);
export const eventModalPlugin = createEventModalPlugin();
export const eventServicePlugin = createEventsServicePlugin();
export const calendarControlsPlugin = createCalendarControlsPlugin();
const currentTimePlugin = createCurrentTimePlugin();

const taskStore = useTaskStore();

/**
 * Fetch periods when resources are used.
 * @param range Range of dates displayed on the calendar
 * @returns Nothing
 */
function getScheduledResources(range: { start: string; end: string }) {
  if (
    range.start === taskStore.getPreviousStart &&
    range.end === taskStore.getPreviousEnd &&
    taskStore.getSelectedTask === taskStore.getPreviousTask
  ) {
    return;
  }
  taskStore
    .fetchResourceSchedule(range.start, range.end, taskStore.getSelectedTask)
    .then(() => {
      if (process.env.debug) {
        console.log('Resource schedule fetched!');
      }
      taskStore.setPreviousCalendarRange(
        range.start,
        range.end,
        taskStore.getSelectedTask,
      );
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
    });
}

// Non-reactive calendar instance
export const calendar = createCalendar({
  //selectedDate: '2023-12-19',
  locale: 'en-GB', // to prevent having the AM/PM suffix in time
  defaultView: viewWeek.name,
  plugins: [
    dragAndDropPlugin,
    resizePlugin,
    eventModalPlugin,
    eventServicePlugin,
    calendarControlsPlugin,
    currentTimePlugin,
  ],
  views: [
    createViewWeek(),
    createViewDay(),
    createViewMonthGrid(),
    createViewMonthAgenda(),
  ],
  weekOptions: {
    timeAxisFormatOptions: { hour: '2-digit', minute: '2-digit' },
  },
  callbacks: {
    onEventUpdate(updatedEvent) {
      if (process.env.debug) {
        console.log('onEventUpdate', updatedEvent);
      }
    },
    onRangeUpdate(range) {
      if (process.env.debug) {
        console.log('onRangeUpdate', range);
      }
      getScheduledResources(range);
      //showResourceSchedule();
    },
    onClickDateTime(dateTime) {
      if (process.env.debug) {
        console.log('onClickDateTime', dateTime); // e.g. 2024-01-01 12:37
      }
      // Only one event can be added (currently scheduled task)
      const event = eventServicePlugin.get(0);
      if (event) {
        return;
      }

      // Get the event end time
      const startDate = date.extractDate(dateTime, dateFormat);
      const endDate = date.formatDate(
        date.addToDate(startDate, { hour: 1 }),
        dateFormat,
      );

      // Add event
      eventServicePlugin.add({
        title: 'Task name',
        description: '',
        start: dateTime,
        end: endDate,
        id: 0,
        calendarId: 'tasks',
      });
    },
  },
  calendars: {
    tasks: {
      label: 'Tasks',
      colorName: 'tasks',
      lightColors: {
        main: '#1976D2',
        container: '#8ab7e3',
        onContainer: '#0c355e',
      },
      darkColors: {
        main: '#b4d1ed',
        onContainer: '#8ab7e3',
        container: '#3f658a',
      },
    },
    nodes: {
      label: 'Nodes',
      colorName: 'nodes',
      lightColors: {
        main: '#d0b316',
        container: '#fff5aa',
        onContainer: '#594800',
      },
      darkColors: {
        main: '#fff5c0',
        onContainer: '#fff5de',
        container: '#a29742',
      },
    },
  },
  events: [],
});
