<script lang="ts" setup>
import { ref } from 'vue'

import service from '@/utils/request'

const emit = defineEmits<{
  (e: 'uploadImage', url: string): void
}>()
defineExpose({
  resetUploadResult,
  openUploadDialog,
})
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadResult = ref<{ url: string } | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  uploadResult.value = null
  error.value = null

  if (!file) {
    error.value = '请选择要上传的文件'
    return
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = `不支持的文件类型，仅支持 ${ALLOWED_TYPES.join(', ')}`
    return
  }

  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    error.value = `文件大小不能超过 ${MAX_SIZE / 1024 / 1024}MB`
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    isLoading.value = true

    const res = await service.request({
      url: '/photo',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (res.status === 200) {
      uploadResult.value = { url: res.data.url }
      emit('uploadImage', uploadResult.value.url)
    }
    else {
      error.value = res.data.error || '上传失败'
    }
  }
  catch (e: any) {
    error.value = e.response?.data?.error || '网络错误或服务器无响应'
  }
  finally {
    isLoading.value = false
    resetUploadResult()
  }
}

function resetUploadResult() {
  uploadResult.value = null
  error.value = null
}

function openUploadDialog() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="min-w-60 mx-auto mt-2 p-6 border border-gray-200 rounded-lg shadow-sm">
    <div v-if="!uploadResult" class="w-full">
      <input
        ref="fileInputRef"
        type="file"
        class="opacity-0 w-full h-full cursor-pointer"
        :accept="ALLOWED_TYPES.toString()"
        :disabled="isLoading"
        @change="handleFileChange"
      >
      <div>
        <span v-if="!isLoading" class="flex center">📤 选择图片</span>
        <span v-else class="flex center">⏳ 上传中...</span>
      </div>
    </div>
    <!-- 上传成功 -->
    <div v-if="uploadResult" class="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
      ✅ 上传成功！
      <img :src="uploadResult.url" alt="Uploaded Image" class="mt-2 max-w-full rounded-md border border-gray-200">
    </div>

    <!-- 上传错误 -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
      ❌ {{ error }}
    </div>
  </div>
</template>
