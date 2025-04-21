<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import type { imageItem, uploadItem } from '@/types/image'
import type { ResponseType } from '@/types/response'

import { addImage, deleteImageById, editImage, getBubuImageList, searchImageByTag } from '@/utils/image'

const isAdd = ref(false)
const isEdit = ref(false)
const showList = ref<imageItem[]>([])
const searchList = ref<imageItem[]>([])
const form = reactive<imageItem>({
  name: '',
  source: '',
  tags: '',
  category: 1,
})
async function getBubuList() {
  const list: ResponseType<imageItem[]> = await getBubuImageList()
  showList.value = list.data
}

async function uploadNewImage(form: uploadItem) {
  isAdd.value = !isAdd.value
  await addImage(form)
  form.name = ''
  form.source = ''
  form.tags = ''
  getBubuList()
}
async function deleteImage(id: string) {
  await deleteImageById(id)
  getBubuList()
}
onMounted(() => {
  getBubuList()
})
const ruleFormRef = ref()

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
const search = ref('')
async function searchByTag(tag: string) {
  const result = await searchImageByTag(tag)
  searchList.value = result.data
}
function clearSearchResult() {
  searchList.value = []
}
const editImageItem = ref<imageItem>({
  name: '',
  source: '',
  tags: '',
  category: 1,
})
function handleEdit(index: number) {
  isEdit.value = !isEdit.value
  editImageItem.value.category = showList.value[index].category
  editImageItem.value.name = showList.value[index].name
  editImageItem.value.source = showList.value[index].source
  editImageItem.value.tags = showList.value[index].tags
  editImageItem.value.id = showList.value[index].id
}
async function updateImageInfo(id: string, form: uploadItem) {
  isEdit.value = !isEdit.value
  await editImage(id, form)
  getBubuList()
}
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-between items-center w-full px-2 py-4">
      <div class="flex flex-between items-center h-full w-1/4 border-pink-300 border-solid border-2 rounded-lg">
        <el-input v-model="search" placeholder="搜索图片" />
        <button class="w-10 h-10 flex center" @click="searchByTag(search)">
          <Icon :height="24" icon="iconamoon:search-bold" />
        </button>
        <button @click="clearSearchResult()">
          <Icon :height="24" icon="tdesign:clear-formatting" />
        </button>
      </div>
      <el-button color="#fce7f3" @click="isAdd = !isAdd">
        <Icon :height="24" icon="material-symbols:add-2-rounded" />
      </el-button>
    </div>
    <div v-if="!searchList.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-2 ">
      <div
        v-for="(item, index) in showList"
        :key="item.id"
        class="bg-pink-100 border-2 border-pink-200 rounded-2xl shadow-md px-3 transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <div class="w-full h-8 flex justify-end m-1">
          <div class="border-black border-solid border-2 rounded-full p-1 hover:bg-yellow hover:cursor-pointer">
            <button class="flex items-center" @click="deleteImage(item.id!)">
              <Icon :height="20" icon="line-md:remove" />
            </button>
          </div>
        </div>
        <img
          :src="item.source"
          :alt="item.name"
          class="w-full h-40 object-cover rounded-xl mb-2"
        >
        <div class="flex justify-center items-center">
          <div class="font-semibold text-pink-500">
            {{ item.name }}
          </div>
          <button><Icon :height="24" icon="material-symbols:edit-square-outline" class="text-yellow-600" @click="handleEdit(index)" /></button>
        </div>
        <div v-if="item.tags" class="mb-2 max-h-14 flex flex-wrap overflow-hidden gap-1 justify-evenly">
          <div v-for="(tag, index) in item.tags.split(',')" :key="index">
            <div class="custom_text bg-pink-400 text-white text-xs text-center font-semibold w-10 h-6 rounded-md items-center justify-center flex">
              <span>{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <span>No Result</span>
    </div>
  </div>
  <el-dialog v-model="isAdd" title="添加新图片" width="50%" center>
    <el-form ref="ruleFormRef" :model="form" label-width="auto" class="w-full" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <!-- <el-upload
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :show-file-list="false"
        >
          <img v-if="form.source" :src="form.source">
          <div v-else>
            <Icon class="text-gray-400" :height="40" icon="icon-park-outline:upload-web" />
          </div>
        </el-upload> -->
        <el-input v-model="form.source" />
      </el-form-item>
      <el-form-item label="图片标签" prop="tags">
        <el-input v-model="form.tags" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isAdd = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="uploadNewImage(form)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="isEdit" title="编辑图片" width="50%" center>
    <el-form :model="editImageItem" label-width="auto" class="w-full" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="editImageItem.name" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <el-input v-model="editImageItem.source" />
      </el-form-item>
      <el-form-item label="图片标签" prop="tags">
        <el-input v-model="editImageItem.tags" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isEdit = !isEdit">
          Cancel
        </el-button>
        <el-button type="primary" @click="updateImageInfo(editImageItem.id!, editImageItem)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.custom_text{
  overflow: hidden;
}
</style>
