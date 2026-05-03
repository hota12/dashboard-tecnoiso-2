<template>
  <MetaAdsBase v-bind="props" :fonteUrl="FONTE_URL" />
</template>

<script setup>
import MetaAdsBase from './MetaAdsBase.vue'

const FONTE_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/d6c68dfd-48db-48f6-8751-19epanzer'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
