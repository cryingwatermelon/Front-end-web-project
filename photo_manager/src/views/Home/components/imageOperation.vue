<script lang="ts" setup>
import type { imageItem } from '@/types/image'
import type { InputInstance } from 'element-plus'

defineEmits<{
  (e: 'updateImage', image: imageItem): void
  (e: 'addImage', image: imageItem): void
}>()

const inputValue = ref('')
const inputVisible = ref(false)
const ruleFormRef = ref()

const form = ref<imageItem>({
  name: '',
  source: '',
  tags: [],
})
const title = computed(() => form.value ? '编辑图片' : '添加图片')

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
const dynamicTags = ref<string[]>(form.value.tags)
function deleteTag(tag: string) {
  dynamicTags.value = dynamicTags.value.filter(item => item !== tag)
}
const tagType = ref<string[]>(['primary', 'success', 'info', 'warning', 'danger'])
const InputRef = ref<InputInstance>()
function handleInputConfirm() {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value)
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
}

defineExpose({
  open: (image?: imageItem) => {
    dialogVisible.value = true
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
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="title" width="50%" center @close="resetForm">
    <el-form ref="ruleFormRef" :model="form" label-width="auto" class="w-full" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <el-input v-model="form.source" />
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
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click.stop="$emit('updateImage', form)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>

</style>
