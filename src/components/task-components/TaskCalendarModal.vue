<template>
  <q-card>
    <q-card-section class="row items-center q-gutter-md">
      <q-input
        outlined
        v-model="title"
        label="Task name"
        style="width: 100%"
        :rules="[(val) => !!val || 'Task name is required!']"
        :disable="props.calendarEvent.calendarId !== 'tasks'"
        @blur="onUpdateTask"
      />
      <TaskTimedatePicker
        :init-date="start"
        label="Task start"
        :disable="props.calendarEvent.calendarId !== 'tasks'"
        @update-date="updateStart"
      />
      <TaskTimedatePicker
        :init-date="end"
        label="Task end"
        :disable="props.calendarEvent.calendarId !== 'tasks'"
        @update-date="updateEnd"
      />
      <q-input
        outlined
        v-model="description"
        label="Description"
        type="textarea"
        style="width: 100%"
        :disable="props.calendarEvent.calendarId !== 'tasks'"
        @blur="onUpdateTask"
      />
    </q-card-section>

    <q-card-actions
      align="right"
      v-if="props.calendarEvent.calendarId === 'tasks'"
    >
      <q-btn
        flat
        label="Remove scheduling"
        color="negative"
        @click="onRemove"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
/**
 * This file is partially based on Vue schedule-x example provided by
 * Tom Österlund, author of ScheduleX calendar library used in this project.
 * Original code is available at the following link
 * https://github.com/schedule-x/vue-example
 */
import { type PropType, ref } from 'vue';
import { eventModalPlugin, eventServicePlugin } from './TaskCalendarConfig';
import TaskTimedatePicker from './TaskTimedatePicker.vue';
import { date } from 'quasar';
import { dateFormat } from '../calendarDateFormat';

const props = defineProps({
  calendarEvent: {
    type: Object as PropType<{
      id: number | string;
      title: string;
      description: string;
      start: string;
      end: string;
      calendarId: string;
    }>,
    required: true,
  },
});

const title = ref(props.calendarEvent.title);
const description = ref(props.calendarEvent.description);
const start = ref(props.calendarEvent.start);
const end = ref(props.calendarEvent.end);

/**
 * Updates task info
 */
function onUpdateTask() {
  const updatedEvent = {
    id: props.calendarEvent.id,
    title: title.value,
    description: description.value,
    start: start.value,
    end: end.value,
    calendarId: 'tasks',
  };
  eventServicePlugin.update(updatedEvent);
}

/*function onCancel() {
  title.value = props.calendarEvent.title;
  description.value = props.calendarEvent.description;
  start.value = props.calendarEvent.start;
  end.value = props.calendarEvent.end;
  eventModalPlugin.close();
}*/

/**
 * Removes task from the calendar
 */
function onRemove() {
  eventServicePlugin.remove(props.calendarEvent.id);
  eventModalPlugin.close();
}

/**
 * Updates task start time
 */
function updateStart(newStart: string) {
  const startDate = date.extractDate(newStart, dateFormat);
  const endDate = date.extractDate(end.value, dateFormat);
  const diff = date.getDateDiff(endDate, startDate, 'minutes');
  console.log(diff);
  if (diff <= 0) {
    end.value = date.formatDate(
      date.addToDate(startDate, { hour: 1 }),
      dateFormat,
    );
  }
  start.value = newStart;
  onUpdateTask();
}

/**
 * Updates task end time
 */
function updateEnd(newEnd: string) {
  const startDate = date.extractDate(start.value, dateFormat);
  const endDate = date.extractDate(newEnd, dateFormat);
  const diff = date.getDateDiff(endDate, startDate, 'minutes');
  console.log(diff);
  if (diff <= 0) {
    // Skip update if end is less then start time.
    // Usually happens during end time update.
    return;
  }
  end.value = newEnd;
  onUpdateTask();
}
</script>
