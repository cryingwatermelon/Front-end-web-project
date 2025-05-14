<script lang="ts" setup>
import { ref } from 'vue'

import service from '@/utils/request'

const emit = defineEmits<{
  (e: 'uploadImage', url: string): void
}>()
defineExpose({
  resetUploadResult,
})

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
  }
}

function resetUploadResult() {
  uploadResult.value = null
  error.value = null
}
</script>

<template>
  <div class="w-200 mx-auto mt-8 p-6 border border-gray-200 rounded-lg shadow-sm">
    <label class="flex flex-col  block px-6 py-3 bg-gray-100 text-center rounded-md cursor-pointer hover:bg-gray-200 transition">
      <input
        type="file"
        class="opacity-0 w-full h-full cursor-pointer"
        :accept="ALLOWED_TYPES.toString()"
        :disabled="isLoading"
        @change="handleFileChange"
      >
      <span v-if="!isLoading" class="mb-4">📤 选择图片</span>
      <span v-else>⏳ 上传中...</span>
    </label>

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
