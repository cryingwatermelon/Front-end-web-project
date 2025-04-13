<script lang="ts" setup>
import { Icon } from '@iconify/vue'

import type { imageItem } from '@/types/image'
import type { ResponseType } from '@/types/response'

import { getBubuImageList } from '@/utils/image'

const isAdd = ref(false)
const showList = ref<imageItem[]>([])
const form = reactive({
  name: '',
  source: '',
  tags: '',
})
async function getBubuList() {
  const list: ResponseType<imageItem[]> = await getBubuImageList()
  showList.value = list.data
  // Object.assign(showList.value, list)
  // console.log('showList', showList)
  // console.log('list', list)
}

function addImage() {
  isAdd.value = !isAdd.value
}
onMounted(() => {
  getBubuList()
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div class="flex justify-between items-center w-full p-2">
      <el-button color="#fce7f3" @click="getBubuList">
        <Icon :height="24" icon="ic:outline-refresh" />
      </el-button>
      <el-button color="#fce7f3" @click="addImage">
        <Icon :height="24" icon="material-symbols:add-a-photo-outline" />
      </el-button>
    </div>
    <div class="grid grid-cols-3 gap-6 p-2 ">
      <div
        v-for="item in showList"
        :key="item.id"
        class="bg-pink-100 border-2 border-pink-200 rounded-2xl shadow-md p-3 transition-transform transform hover:scale-105 hover:shadow-lg"
      >
        <img
          :src="item.source"
          :alt="item.name"
          class="w-full h-40 object-cover rounded-xl mb-2"
        >
        <div class="text-center font-semibold text-pink-500 mb-2">
          {{ item.name }}
        </div>
        <div v-if="item.tags" class="grid grid-cols-2 gap-1 mb-2">
          <div v-for="(tag, index) in item.tags.split(',')" :key="index">
            <div class="bg-pink-400 text-white text-xs font-semibold px-2 py-1 rounded-lg truncate">
              <span>{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="isAdd" title="添加新图片" width="50%" center>
    <el-form :model="form" label-width="auto" class="w-full">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="上传图片" prop="source">
        <el-upload
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :show-file-list="false"
        >
          <img v-if="form.source" :src="form.source">
          <div v-else>
            <Icon class="text-gray-400" :height="40" icon="icon-park-outline:upload-web" />
          </div>
        </el-upload>
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
        <el-button type="primary" @click="isAdd = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>

</style>
