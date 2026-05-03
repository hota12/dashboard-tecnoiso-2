<template>
  <MetaAdsBase v-bind="props" :fonteUrl="FONTE_URL" />
</template>

<script setup>
import MetaAdsBase from './MetaAdsBase.vue'

const FONTE_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/29469c2c-f5ce-4d2d-8569-f286418a399a'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
