<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const isCollapse = ref(false)
function handleOpen(key: string, keyPath: string[]) {
  console.log('keyPath', keyPath)
}
function handleClose(key: string, keyPath: string[]) {
  console.log('keyPath', keyPath)
}

function handleCollapse() {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <div class="transition-width duration-300" ease-in-out :class="isCollapse ? 'w-64px' : 'w-200px'">
    <div class="cursor-pointer w-full">
      <div v-if="isCollapse" @click="handleCollapse">
        <div class="flex justify-center ">
          <Icon icon="material-symbols:arrow-forward-ios-rounded" :height="24" class="text-gray-500" />
        </div>
      </div>
      <div v-else @click="handleCollapse">
        <div class="flex justify-end">
          <Icon icon="material-symbols:arrow-back-ios" :height="24" class="text-gray-500" />
        </div>
      </div>
    </div>
    <el-menu
      default-active="1"
      :collapse="isCollapse"
      router
      @open="handleOpen"
      @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
          <div v-if="!isCollapse" class="flex gap-2 items-center">
            <Icon icon="material-symbols:imagesmode-outline" :height="24" />
            <span>单人</span>
          </div>
          <div v-else>
            <Icon icon="material-symbols:imagesmode-outline" :height="24" />
          </div>
        </template>
        <el-menu-item index="/home/bubu">
          <template #title>
            布布
          </template>
        </el-menu-item>
        <el-menu-item index="/home/yier">
          <template #title>
            一二
          </template>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/home/family">
        <div v-if="!isCollapse" class="flex gap-2 items-center">
          <Icon icon="icon-park-outline:family" :height="24" />
          <span>合照</span>
        </div>
        <div v-else>
          <Icon icon="icon-park-outline:family" :height="24" />
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>

</style>
