import service from './request'

export const getBubuImageList = function () {
  return service.request({
    url: '/photo/bubuList',
    method: 'get',
  })
}
