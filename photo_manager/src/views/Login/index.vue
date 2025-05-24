<!-- eslint-disable no-console -->
<script lang="ts" setup>
import multiavatar from '@multiavatar/multiavatar/esm'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import type { UserData } from '@/types/user'

import { useUserStore } from '@/store'
import { login } from '@/utils/user'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const rememberMe = ref(false)

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<UserData>({
  username: 'admin',
  password: '67890',
})

const rules = reactive<FormRules<UserData>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, message: '长度至少为5', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
})
async function onSubmit(formEl: FormInstance | undefined) {
  isLoading.value = true
  if (!formEl) {
    return
  }

  // // login request
  // try {
  //   // username password validate
  //   await formEl.validate((valid, fields) => {
  //     if (!valid) {
  //       throw new Error('用户名或密码错误', fields)
  //     }
  //     const result = await login(ruleForm)
  //     console.log('result', result)
  //     const userStore = useUserStore()
  //     userStore.saveToken(result?.data?.token)
  //     router.push(route.query.redirect as string || '/home/bubu')
  //   })
  // }
  // catch (error) {
  //   if (error instanceof AxiosError) {
  //     console.error(error)
  //     ElMessage({
  //       type: 'error',
  //       message: error.response!.data.message,
  //     })
  //   }
  // }
  try {
    const valid = await formEl.validate()
    if (!valid) {
      // throw new Error('用户名或密码错误')
      throw new Error('用户名或密码错误')
    }
    const result = await login(ruleForm)
    const userStore = useUserStore()
    userStore.saveToken(result?.data?.token)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.trim()
    router.push(redirect || '/home/bubu')
  }
  catch (error) {
    if (error) {
      ElMessage({
        type: 'error',
        message: error instanceof Error ? error.message : '用户名或密码错误',
      })
    }
    else {
      ElMessage({
        type: 'error',
        message: '未知错误',
      })
    }
  }
  isLoading.value = false
}
const avatarUrl = computed(() => {
  return multiavatar(ruleForm.username)
})
// function resetFrom(formEl: FormInstance | undefined) {
//   if (!formEl)
//     return
//   console.log(formEl)
//   formEl.resetFields()
//   ruleForm.username = ''
//   ruleForm.password = ''
// }
</script>

<template>
  <div class="min-h-screen bg-pink-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-lg max-w-md w-full relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute -top-12 -right-12 w-24 h-24 bg-pink-200 rounded-full" />
      <div class="absolute -bottom-12 -left-12 w-28 h-28 bg-pink-100 rounded-full" />

      <div class="p-8 relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-pink-500 mb-4">
            Welcome Back!
          </h1>
          <div alt="avatar" class="w-24 h-24 mx-auto rounded-full" v-html="avatarUrl" />
          <!-- Cute character -->
        </div>

        <!-- Form -->
        <div class="mb-5">
          <el-form ref="ruleFormRef" :rules="rules" :model="ruleForm" label-width="80px" style="max-width: 600px">
            <el-form-item label="用户名" prop="username" class="custom-el-form-item-label w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 transition">
              <el-input v-model="ruleForm.username" size="large" />
            </el-form-item>
            <el-form-item label="密码" prop="password" class="custom-el-form-item-label w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 transition">
              <el-input v-model="ruleForm.password" type="password" size="large" show-password />
            </el-form-item>
          </el-form>
          <el-form-item class="mb-6 w-full ">
            <div class="flex justify-between items-center w-full">
              <div class="flex items-center">
                <input
                  id="remember"
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-4 h-4 accent-pink-500"
                >
                <label for="remember" class="ml-2 text-sm text-gray-600">Remember me</label>
              </div>
              <div>
                <a href="#" class="text-sm text-pink-500 hover:underline font-medium">Forgot password?</a>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <button
              type="submit"
              class="w-full py-3 bg-pink-500 text-pink-600 font-bold rounded-2xl hover:bg-pink-600 transition transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none hover:text-white"
              @click="onSubmit(ruleFormRef)"
            >
              <span v-if="!isLoading">Login</span>
              <div v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading...</span>
              </div>
            </button>
          </el-form-item>
        </div>

        <div class="text-center mt-6 text-sm text-gray-600">
          Don't have an account?
          <a href="#" class="text-pink-500 font-semibold hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-el-form-item-label{
  align-items: center;
}
</style>
