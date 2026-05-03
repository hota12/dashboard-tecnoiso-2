<template>
  <MetaAdsBase v-bind="props" :fonteUrl="FONTE_URL" />
</template>

<script setup>
import MetaAdsBase from './MetaAdsBase.vue'

const FONTE_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/be04b3fd-b875-4baf-bad4-839433ed8b4c'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
