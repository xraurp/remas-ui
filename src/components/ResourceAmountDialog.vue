<template>
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">Resource amount</div>
    </q-card-section>

    <q-card-section class="q-pt-none row">
      <q-input
        dense
        v-model="amount"
        autofocus
        type="number"
        label="Amount"
        class="col"
      />
      <q-select
        dense
        v-model="selectedUnit"
        :options="unitListOptions"
        label="Unit"
        class="col-3"
        :disable="unitListOptions.length < 2"
      />
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn
        flat
        label="Confirm"
        v-close-popup
        @click="confirm"
        :disable="!amount"
      />
      <q-btn flat label="Cancel" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { Unit } from './db_models';
import { ref } from 'vue';
import { getBytesConversion, getUnitList } from './aux_functions';

const props = defineProps<{
  startingAmount: number | undefined;
  unitType: Unit;
}>();

const emit = defineEmits<{
  confirmAmount: [
    {
      amount: number;
      unit_str: string;
    },
  ];
}>();

// list of options (e.g. ['B', 'KB', 'MB'])
const unitListOptions = ref<string[]>(getUnitList(props.unitType));

let startingValue = {
  amount: props.startingAmount || 0,
  unit_str: unitListOptions.value[0] || '',
};
if (props.startingAmount !== undefined && props.unitType !== Unit.NONE) {
  startingValue = getBytesConversion(props.startingAmount, props.unitType);
}

// selected amount
const amount = ref(startingValue.amount);

// selected option
const selectedUnit = ref(startingValue.unit_str);

function confirm() {
  emit('confirmAmount', {
    amount: amount.value,
    unit_str: selectedUnit.value,
  });
}
</script>
