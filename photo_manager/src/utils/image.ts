import service from './request'

import type { uploadItem } from '@/types/image'

export const getBubuImageList = function () {
  return service.request({
    url: '/photo/bubuList',
    method: 'get',
  })
}

export const addImage = function (data: uploadItem) {
  return service.request({
    url: '/photo/upload',
    method: 'post',
    data,
  })
}

export const deleteImageById = function (id: string) {
  return service.request({
    url: `/photo/${id}`,
    method: 'delete',
  })
}

export const searchImageByTag = function (tag: string) {
  return service.request({
    url: `/photo/${tag}`,
    method: 'post',
  })
}

export const editImage = function (id: string, data: uploadItem) {
  return service.request({
    url: `/photo/update/${id}`,
    method: 'patch',
    data,
  })
}
