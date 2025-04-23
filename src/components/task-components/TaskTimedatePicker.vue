<template>
  <div style="width: 100%">
    <q-input filled v-model="date" :label="props.label">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="date"
              mask="YYYY-MM-DD HH:mm"
              first-day-of-week="1"
              :disable="props.disable"
            >
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  label="Close"
                  color="primary"
                  flat
                  :disable="props.disable"
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time
              v-model="date"
              mask="YYYY-MM-DD HH:mm"
              format24h
              :disable="props.disable"
            >
              <div class="row items-center justify-end">
                <q-btn
                  v-close-popup
                  label="Close"
                  color="primary"
                  flat
                  :disable="props.disable"
                />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  initDate: {
    type: String,
    required: true,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['updateDate']);

const date = ref(props.initDate);

watch(date, () => {
  if (!props.disable) {
    emit('updateDate', date.value);
  }
});
</script>
