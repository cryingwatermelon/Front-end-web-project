<script lang="ts" setup>
import { ref } from 'vue'

import service from '@/utils/request'

const uploadResult = ref<{ size: number } | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false) // 添加加载状态

// 允许的文件类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  // 重置状态
  uploadResult.value = null
  error.value = null

  if (!file) {
    error.value = '请选择要上传的文件'
    return
  }

  // 文件类型验证
  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = `不支持的文件类型，仅支持 ${ALLOWED_TYPES.join(', ')}`
    return
  }

  // 文件大小验证（示例限制5MB）
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
      url: '/photo/uploadFile',
      method: 'POST',
      data: formData,
      headers: {
        // 显式清除 Content-Type 让浏览器自动设置
        'Content-Type': undefined,
      },
    })
    console.log('res', res)
    if (res.status === 200) {
      uploadResult.value = { size: res.data.size }
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
</script>

<template>
  <div class="upload-container">
    <label class="file-input-wrapper">
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        :disabled="isLoading"
        @change="handleFileChange"
      >
      <span v-if="!isLoading">📤 选择图片</span>
      <span v-else>⏳ 上传中...</span>
    </label>

    <!-- 状态反馈 -->
    <div v-if="uploadResult" class="success-message">
      ✅ 上传成功！
      <div class="file-info">
        文件大小：{{ (uploadResult.size / 1024).toFixed(2) }} KB
      </div>
    </div>

    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.upload-container {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  .file-input-wrapper {
    display: block;
    position: relative;
    cursor: pointer;
    padding: 12px 24px;
    background: #f0f2f5;
    border-radius: 6px;
    text-align: center;
    transition: background 0.3s;

    &:hover {
      background: #e4e6eb;
    }

    input[type="file"] {
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    span {
      font-size: 14px;
      color: #333;
    }
  }

  .success-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #e8f5e9;
    border-radius: 4px;
    color: #2e7d32;

    .file-info {
      margin-top: 0.5rem;
      font-size: 0.9em;
      color: #666;
    }
  }

  .error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #ffebee;
    border-radius: 4px;
    color: #c62828;
  }
}
</style>
