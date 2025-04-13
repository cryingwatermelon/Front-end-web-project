<script setup lang='ts'>
import multiavatar from '@multiavatar/multiavatar'

import { useAppStore } from '@/store'

const appStore = useAppStore()
const logo = multiavatar('cryingwatermelon')
</script>

<template>
  <div class="flex items-center gap-2">
    <div alt="瓜的logo" class="w-8 h-8 rounded-2xl" v-html="logo" />
    <span class="text-sm">
      {{ appStore.appName }}
    </span>
  </div>
</template>

<style>

</style>
