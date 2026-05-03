<template>
  <MetaAdsBase v-bind="props" :fonteUrl="FONTE_URL" />
</template>

<script setup>
import MetaAdsBase from './MetaAdsBase.vue'

const FONTE_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/58c00142-cfb9-408c-870c-f486336119f0'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
