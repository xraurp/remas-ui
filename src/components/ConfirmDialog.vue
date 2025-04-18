<template>
  <q-card>
    <q-card-section class="row items-center">
      <slot name="message"></slot>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        label="Confirm"
        color="negative"
        @click="$emit('confirm')"
        v-close-popup
      />
      <q-btn flat label="Cancel" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
defineEmits(['confirm']);
</script>
