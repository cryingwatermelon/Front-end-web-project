<script lang="ts" setup>
import type Uploader from '@/components/Uploader.vue'
import type { imageItem } from '@/types/image'
import type { InputInstance } from 'element-plus'

const emit = defineEmits<{
  (e: 'updateImage', image: imageItem): void
  (e: 'addImage', image: imageItem): void
}>()

const inputValue = ref('')
const inputVisible = ref(false)
const ruleFormRef = ref()
const uploaderRef = ref<InstanceType<typeof Uploader>>()
const form = ref<imageItem>({
  name: '',
  source: '',
  tags: [],
  category: 1,
})
const isEditMode = ref(false)
const title = computed(() => {
  return isEditMode.value ? '编辑图片' : '添加图片'
})
const rules = reactive({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
  source: [
    { required: true, message: '请输入图片地址', trigger: 'blur' },
  ],
  tags: [
    { required: true, message: '请输入图片标签', trigger: 'blur' },
  ],
})
const dialogVisible = ref(false)

function deleteTag(tag: string) {
  form.value.tags = form.value.tags.filter(item => item !== tag)
}
const tagType = ref<string[]>(['primary', 'success', 'info', 'warning', 'danger'])
const InputRef = ref<InputInstance>()
function handleInputConfirm() {
  if (inputValue.value) {
    form.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
function showInput() {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

function resetForm() {
  ruleFormRef.value?.resetFields()
  uploaderRef.value?.resetUploadResult()
  isEditMode.value = false
}

function handleCancel() {
  dialogVisible.value = false
  resetForm()
}

function handleConfirm() {
  if (form.value.id?.length) {
    emit('updateImage', form.value)
  }
  else {
    emit('addImage', form.value)
  }
  dialogVisible.value = false
  resetForm()
}
defineExpose({
  open: (image?: imageItem) => {
    dialogVisible.value = true
    isEditMode.value = !!image
    if (image) {
      nextTick(() => {
        // Object.assign(form.value, image)
        form.value = {
          ...image,
        }
      })
    }
  },
  close: () => dialogVisible.value = false,
})
// const imageUrl = ref('')

// 拿到七牛云返回的链接
function receiveUrl(url: string) {
  form.value.source = url
}
function evokeUploader() {
  uploaderRef.value?.openUploadDialog()
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" width="50%" center @close="resetForm">
    <el-form ref="ruleFormRef" :model="form" label-width="auto" class="w-full flex flex-col" :rules="rules">
      <el-form-item label="名称" prop="name" label-position="left">
        <el-input v-model="form.name" class="" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <div v-if="form.source" class="relative w-full group">
          <img :src="form.source" alt="图片" class="w-full object-cover rounded">
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded cursor-pointer"
          >
            <el-button type="primary" size="small" @click="evokeUploader()">
              替换图片
            </el-button>
          </div>
        </div>
        <Uploader ref="uploaderRef" :class="form.source && 'hidden'" @upload-image="receiveUrl" />
      </el-form-item>

      <el-form-item label="图片标签" prop="tags">
        <div class="flex gap-2 flex-wrap">
          <el-tag v-for="(tag, tagIndex) in form.tags" :key="tag" :type="tagType[tagIndex % 4]" closable @close="deleteTag(tag)">
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + New Tag
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex justify-center gap-8">
        <el-button @click="handleCancel">
          取消
        </el-button>
        <el-button @click.stop="handleConfirm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #111;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
