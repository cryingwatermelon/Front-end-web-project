<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import ImageOperation from './imageOperation.vue'

import type { imageItem, uploadItem } from '@/types/image'
import type { ResponseType } from '@/types/response'

import { addImage, deleteImageById, editImage, getBubuImageList, searchImageByTag } from '@/utils/image'

const isAdd = ref(false)
const isEdit = ref(false)
const inputValue = ref('')
const inputVisible = ref(false)
const showList = ref<imageItem[]>([])
const searchList = ref<imageItem[]>([])

async function getBubuList() {
  const list: ResponseType<imageItem[]> = await getBubuImageList()
  showList.value = list.data
  console.log('showList', showList)
  for (let i = 0; i < showList.value.length; i++) {
    const item = showList.value[i]
    console.log(JSON.parse(item.tags))
  }
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
function parseArray(value: string): string[] {
  try {
    return JSON.parse(value)
  }
  catch {
    return []
  }
}
const title = ref('')
const tagType = ref<string[]>(['primary', 'success', 'info', 'warning', 'danger'])
const operation = ref(false)
function handleAdd() {
  title.value = '添加'
  operation.value = true
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
      <el-button color="#fce7f3" @click="handleAdd()">
        <Icon :height="24" icon="material-symbols:add-2-rounded" />
      </el-button>
    </div>
    <div v-if="!searchList.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-2 ">
      <div
        v-for="image in showList"
        :key="image.id"
        class="bg-pink-100 border-2 border-pink-200 rounded-2xl shadow-md px-3 transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <div class="w-full h-8 flex justify-end m-1">
          <div class="border-black border-solid border-2 rounded-full p-1 hover:bg-yellow hover:cursor-pointer">
            <button class="flex items-center" @click="deleteImage(image.id!)">
              <Icon :height="20" icon="line-md:remove" />
            </button>
          </div>
        </div>
        <img
          :src="image.source"
          :alt="image.name"
          class="w-full h-40 object-cover rounded-xl mb-2"
        >
        <div class="flex justify-center items-center mb-2">
          <div class="font-semibold text-pink-500">
            {{ image.name }}
          </div>
          <button><Icon :height="24" icon="material-symbols:edit-square-outline" class="text-yellow-600" @click="title = '编辑'" /></button>
        </div>
        <div v-if="image.tags" class="flex flex-wrap gap-2 mb-2">
          <el-tag v-for="(tag, tagIndex) in parseArray(image.tags)" :key="tag" :type="tagType[tagIndex % 4]">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    <div v-else>
      <span>No Search Result</span>
    </div>
    <ImageOperation :operation="operation" :title="title" :image="editImageItem" @upload-new-image="uploadNewImage" />
  </div>
</template>

<style lang="scss" scoped>
.custom_text{
  overflow: hidden;
}
</style>
