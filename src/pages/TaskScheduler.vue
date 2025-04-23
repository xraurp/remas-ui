<template>
  <q-page padding>
    <div class="row q-gutter-sm q-pa-sm">
      <div class="col-3">
        <q-card style="height: 100%" class="task-scheduler-sidebar">
          <q-card-section
            style="height: fit-content"
            class="task-scheduler-resource-selector"
          >
            <q-select
              filled
              :model-value="selectedResources"
              :options="availableResources"
              label="Select resources"
              @update:model-value="(value) => onResourceChanged(value)"
              multiple
              use-chips
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>{{
                      scope.opt.description
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side
                    ><q-chip
                      v-for="alias in scope.opt.aliases"
                      :key="alias.id"
                      >{{ alias.name }}</q-chip
                    >
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Selected nodes:</div>
            <q-separator />
            <q-scroll-area
              style="height: 60vh"
              class="task-scheduler-selected-nodes"
            >
              <div class="q-pa-md row items-start q-gutter-md">
                <template v-for="node in selectedNodes" :key="node.id">
                  <task-node-item :node="node" :limits="[]">
                    <template #actions>
                      <q-btn flat color="primary" @click="onDeselectNode(node)"
                        >Remove</q-btn
                      >
                    </template>
                  </task-node-item>
                </template>
              </div>
            </q-scroll-area>
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Available nodes:</div>
            <q-separator />
            <q-scroll-area
              style="height: 60vh"
              class="task-scheduler-selected-nodes"
            >
              <div>
                <template v-for="node in availableNodes" :key="node.id">
                  <task-node-item :node="node" :limits="[]">
                    <template #actions>
                      <q-btn flat color="primary" @click="onSelectNode(node)"
                        >Select</q-btn
                      >
                    </template>
                  </task-node-item>
                </template>
              </div>
            </q-scroll-area>
          </q-card-section>
          <q-card-section>
            <q-btn
              color="positive"
              label="Schedule task"
              @click="onScheduleTask"
              style="width: 100%"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col">
        <ScheduleXCalendar :calendar-app="calendar">
          <template #eventModal="{ calendarEvent }">
            <TaskCalendarModal :calendar-event="calendarEvent" />
          </template>
        </ScheduleXCalendar>
      </div>
    </div>
    <q-dialog v-model="showDialog" persistent>
      <ResourceAmountDialog
        :starting-amount="0"
        :unit-type="selectedResource?.unit || Unit.NONE"
        v-on:confirm-amount="confirmAddResource"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ScheduleXCalendar } from '@schedule-x/vue';
import {
  calendar,
  calendarControlsPlugin,
} from 'src/components/task-components/TaskCalendarConfig';
import { useQuasar, date } from 'quasar';
import {
  getConversion,
  getConversionInverse,
  getMessageFromError,
  getNumericId,
} from 'src/components/aux_functions';
import ResourceAmountDialog from 'src/components/resource-components/ResourceAmountDialog.vue';
import { eventServicePlugin } from 'src/components/task-components/TaskCalendarConfig';
import TaskCalendarModal from 'src/components/task-components/TaskCalendarModal.vue';
import { useNodeResourceStore } from 'src/stores/node-resource-store';
import { useTaskStore } from 'src/stores/task-store';
import { computed, onMounted, ref, toRefs, watch } from 'vue';
import type {
  Resource,
  NodeResource,
  Node,
  Task,
} from 'src/components/db_models';
import { Unit } from 'src/components/db_models';
import TaskNodeItem from 'src/components/task-components/TaskNodeItem.vue';
import { dateFormat } from 'src/components/calendarDateFormat';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

interface SelectedResource {
  label: string;
  value: NodeResource;
}

// TODO - set dynamic height of the node select bar (using vue refs)

const numericId = computed(() => getNumericId(props.id));

const nodeResourceStore = useNodeResourceStore();
const taskStore = useTaskStore();
const $q = useQuasar();

const showDialog = ref(false);
const selectedResource = ref<Resource>();

const selectedResources = ref<SelectedResource[]>([]);
const selectedNodes = ref<Node[]>([]);

const availableResources = computed(() =>
  nodeResourceStore.getResources.filter(
    (r) => !selectedResources.value.find((rr) => rr.value.id === r.id),
  ),
);
const availableNodes = computed(() =>
  getNodesWithResources(
    nodeResourceStore.getNodes,
    selectedNodes.value,
    selectedResources.value,
  ),
);

function showResourceSchedule() {
  for (const period of taskStore.getResourceSchedule) {
    const node_ids = period.available_resources
      .filter((ar) =>
        selectedResources.value.find(
          (sr) => sr.value.id === ar.resource_id && sr.value.amount > ar.amount,
        ),
      )
      .map((ar) => ar.node_id);
    const start_time = date.formatDate(new Date(period.start_time), dateFormat);
    const end_time = date.formatDate(new Date(period.end_time), dateFormat);
    const event_id = date.formatDate(
      new Date(period.start_time),
      'YYYYMMDDHHMM',
    );
    const event = eventServicePlugin.get(event_id);
    if (!node_ids.length) {
      if (event) {
        eventServicePlugin.remove(event.id);
      }
      continue;
    }
    const nodes = availableNodes.value.filter(
      (n) => n.id && node_ids.includes(n.id),
    );
    const event_body = {
      id: event_id,
      title: `Unavalible nodes: ${nodes.map((n) => n.name).join(', ')}!`,
      description: `Unavalible nodes: ${nodes.map((n) => n.name).join(', ')}!`,
      start: start_time,
      end: end_time,
      calendarId: 'nodes',
    };
    if (event) {
      eventServicePlugin.update(event_body);
    } else {
      eventServicePlugin.add(event_body);
    }
  }
}

function onResourceChanged(resources: (SelectedResource | Resource)[]) {
  if (!resources) {
    return;
  }

  // new value will be of type Resource -- label is not defined there
  const resource = resources.find(
    (r) => !('label' in r) || r.label === undefined,
  );

  // select new resource and show dialog to select amount
  if (resource && 'name' in resource && 'unit' in resource) {
    selectedResource.value = resource;
    showDialog.value = true;
  }
  // value was removed not added -- remove from selectedResources
  else {
    selectedResources.value = selectedResources.value.filter((r) =>
      resources.some((resource) => resource === r),
    );
    showResourceSchedule();
  }
}

function confirmAddResource(newAmount: { amount: number; unit_str: string }) {
  if (!selectedResource.value) {
    $q.notify({ type: 'negative', message: 'Failed to add resource!' });
    return;
  }

  const _amount = getConversionInverse(
    newAmount.amount,
    newAmount.unit_str,
    selectedResource.value.unit,
  );
  const newVal = <NodeResource>{
    ...selectedResource.value,
    amount: _amount,
  };
  selectedResources.value.push({
    label: getSelectedResourcesLabel(newVal),
    value: newVal,
  });

  selectedResource.value = undefined;
  showResourceSchedule();
}

function getSelectedResourcesLabel(resource: NodeResource) {
  const { amount, unit_str } = getConversion(resource.amount, resource.unit);
  return `${resource.name}: ${amount} ${unit_str}`;
}

function getNodesWithResources(
  nodes: Node[],
  selected: Node[],
  resources: SelectedResource[],
) {
  return nodes.filter((n) => {
    if (selected.includes(n)) {
      return false;
    }
    if (resources.length === 0) {
      return true;
    }
    for (const r of resources) {
      if (!n.resources) {
        return false;
      }
      const res = n.resources.find((nr) => nr.id === r.value.id);
      if (!res) {
        return false;
      }
      if (res.amount < r.value.amount) {
        return false;
      }
    }
    return true;
  });
}

function onSelectNode(node: Node) {
  if (selectedNodes.value.includes(node)) {
    return;
  } else {
    selectedNodes.value.push(node);
  }
}

function onDeselectNode(node: Node) {
  selectedNodes.value = selectedNodes.value.filter((n) => n !== node);
}

async function onScheduleTask() {
  const eventData = eventServicePlugin.get(0);
  if (!eventData || !eventData.title) {
    $q.notify({
      type: 'negative',
      message: 'Task name must be set!',
    });
    return;
  }
  if (!eventData.start || !eventData.end) {
    $q.notify({
      type: 'negative',
      message: 'Start and end date must be set!',
    });
    return;
  }
  if (!selectedResources.value || selectedResources.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'At least one resource must be selected for the task!',
    });
    return;
  }
  if (!selectedNodes.value || selectedNodes.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'At least one node must be selected for the task!',
    });
    return;
  }
  const allocations = [];
  for (const node of selectedNodes.value) {
    for (const resource of selectedResources.value) {
      if (!node.resources?.find((r) => r.id === resource.value.id)) {
        $q.notify({
          type: 'negative',
          message: `Resource ${resource.value.name} is not available on node ${node.name}!`,
        });
        return;
      }
      allocations.push({
        node_id: node.id,
        resource_id: resource.value.id,
        amount: resource.value.amount,
      });
    }
  }

  const scheduledTask = <Task>{
    id: numericId.value ?? null,
    name: eventData?.title ?? '',
    description: eventData?.description ?? '',
    start_time: eventData?.start ?? '',
    end_time: eventData?.end ?? '',
    resource_allocations: allocations,
    tag_ids: [],
  };

  await taskStore
    .createOrUpdateTask(scheduledTask)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Task scheduled successfully!',
      });
    })
    .catch((error) => {
      if (process.env.debug) {
        console.log(error);
      }
      const message = getMessageFromError(error, 'Failed to schedule task!');
      $q.notify({ type: 'negative', message });
    });
}

onMounted(async () => {
  try {
    if (!nodeResourceStore.getResources.length) {
      await nodeResourceStore.fetchResources();
    }
    if (!nodeResourceStore.getNodes.length) {
      await nodeResourceStore.fetchNodes();
    }
    if (!taskStore.getTasks.length) {
      await taskStore.fetchTasks();
    }
  } catch (error) {
    if (process.env.debug) {
      console.log(error);
    }
    $q.notify({
      type: 'negative',
      message: getMessageFromError(error, 'Failed to fetch data from server!'),
    });
  }
  const events = eventServicePlugin.getAll();
  for (const event of events) {
    eventServicePlugin.remove(event.id);
  }
  calendarControlsPlugin.setView('week');
});

const { getResourceSchedule } = toRefs(taskStore);
watch(getResourceSchedule, () => {
  showResourceSchedule();
});
</script>
