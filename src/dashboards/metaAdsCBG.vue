<template>
  <MetaAdsBase v-bind="props" :fonteUrl="FONTE_URL" />
</template>

<script setup>
import MetaAdsBase from './MetaAdsBase.vue'

const FONTE_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/19a5da67-0255-403a-b148-73a971670ade'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
