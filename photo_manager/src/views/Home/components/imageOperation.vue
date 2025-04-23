<script lang="ts" setup>
import type { imageItem } from '@/types/image'
import type { InputInstance } from 'element-plus'

const props = defineProps<{
  operation: boolean
  title: string
  image?: imageItem
}>()
const emit = defineEmits(['updateImage', 'addImage'])

const inputValue = ref('')
const inputVisible = ref(false)
const ruleFormRef = ref()
const form = reactive<imageItem>({
  name: props.image?.name || '',
  source: props.image?.source || '',
  tags: props.image?.tags || '',
  category: props.image?.category || 1,
  id: props.image?.id || '',
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
const dialogVisible = ref(true)

function parseArray(value: string): string[] {
  try {
    return JSON.parse(value)
  }
  catch {
    return []
  }
}
const dynamicTags = ref<string[]>(parseArray(form.tags))
function deleteTag(tag: string) {
  dynamicTags.value = dynamicTags.value.filter(item => item !== tag)
  form.tags = JSON.stringify(dynamicTags.value)
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
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`${title}图片`" width="50%" center>
    <el-form ref="ruleFormRef" :model="form" label-width="auto" class="w-full" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <el-input v-model="form.source" />
      </el-form-item>
      <el-form-item label="图片标签" prop="tags">
        <div class="flex gap-2 flex-wrap">
          <el-tag v-for="(tag, tagIndex) in parseArray(form.tags)" :key="tag" :type="tagType[tagIndex % 4]" closable @close="deleteTag(tag)">
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
        <el-button type="primary" @click="emit('updateNewImage', form)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>

</style>
