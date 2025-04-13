<!-- eslint-disable no-console -->
<script lang="ts" setup>
import { RouterView } from 'vue-router'

import { useUserInfoStore } from '@/store'
import { getUserInfo } from '@/utils/user'

const { saveUserInfo, avatar_url, email } = useUserInfoStore()
onMounted(async () => {
  const userInfo = await getUserInfo()
  saveUserInfo({
    email: userInfo.data.email,
    avatar_url: userInfo.data.avatar_url,
  })
})
</script>

<template>
  <div class="common-layout">
    <el-container class="h-[100vh]">
      <el-header class="flex justify-between bg-pink-100">
        <Logo /><User :avatar-url="avatar_url" :email="email" />
      </el-header>
      <el-container>
        <el-aside class="bg-pink-100 custom-aside">
          <Menu />
        </el-aside>
        <el-main class="bg-yellow-50">
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.custom-aside{
  background-color: #fff !important;
  width: auto !important;
}
</style>
