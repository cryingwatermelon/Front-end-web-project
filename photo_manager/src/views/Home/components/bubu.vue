<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import Dialog from './Dialog.vue'

import type { imageItem } from '@/types/image'
import type { ResponseType } from '@/types/response'

import { addImage, deleteImageById, editImage, getBubuImageList, searchImageByTag } from '@/utils/image'

const showList = ref<imageItem[]>([])
const searchList = ref<imageItem[]>([])
const DialogRef = ref<InstanceType<typeof Dialog>>()
async function getBubuList() {
  const list: ResponseType<imageItem[]> = await getBubuImageList()
  showList.value = list.data
}

async function handleAddNewImage(form: imageItem) {
  // console.log('form', form)
  await addImage(form)
  getBubuList()
}
async function handleEditImage(form: imageItem) {
  // TODO editImage传入id
  const id = form.id
  await editImage(id!, form)
  getBubuList()
}
function deleteImage(id: string) {
  ElMessageBox.confirm(
    'Image will permanently delete the file. Continue?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
      center: true,
    },
  )
    .then(async () => {
      await deleteImageById(id)
      ElMessage({
        type: 'success',
        message: 'Delete completed',
      })
      getBubuList()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Delete canceled',
      })
    })
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

const title = ref('')
const tagType = ref<string[]>(['primary', 'success', 'info', 'warning', 'danger'])

function handleAdd() {
  title.value = '添加'
  DialogRef.value?.open()
}
function handleEdit(image: imageItem) {
  title.value = '编辑'
  DialogRef.value?.open(image)
}
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- <img src="http://svuzwd4n0.hb-bkt.clouddn.com/bubu%E5%B0%B1%E4%BD%A0.gif" class="w-[100px] h-[100px] mb-2"> -->
    <!-- 顶部搜索和添加按钮 -->
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
    <!-- 图片列表 -->
    <div v-if="!searchList.length" class="overflow-y-auto max-h-[70vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-2 ">
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
          <button><Icon :height="24" icon="material-symbols:edit-square-outline" class="text-yellow-600" @click="handleEdit(image)" /></button>
        </div>
        <div v-if="image.tags" class="flex flex-wrap gap-2 mb-2">
          <el-tag v-for="(tag, tagIndex) in image.tags" :key="tag" :type="tagType[tagIndex % 4]">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-2 ">
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
            <button><Icon :height="24" icon="material-symbols:edit-square-outline" class="text-yellow-600" @click="handleEdit(image)" /></button>
          </div>
          <div v-if="image.tags" class="flex flex-wrap gap-2 mb-2">
            <el-tag v-for="(tag, tagIndex) in image.tags" :key="tag" :type="tagType[tagIndex % 4]">
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <Dialog ref="DialogRef" @add-image="handleAddNewImage" @update-image="handleEditImage" />
  </div>
</template>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #FBCFE8; // Tailwind 的 pink-300
  border-radius: 9999px;
}
</style>
