<template>
  <GoogleAdsBase v-bind="props" :fonteAdsUrl="FONTE_ADS_URL" :fonteKeywordsUrl="FONTE_KEYWORDS_URL" />
</template>

<script setup>
import GoogleAdsBase from './GoogleAdsBase.vue'

const FONTE_ADS_URL      = 'https://nexus-n8n.2wdiso.easypanel.host/a/07f9f673-d4bf-40cf-9428-a822tecno'
const FONTE_KEYWORDS_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/07f9fdwdwwww-9421312213123ctecno'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})
</script>
