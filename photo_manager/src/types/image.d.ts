// 应该改为IUploadItem格式
export interface uploadItem {
  name: string
  source: string
  tags: string[]
}
export interface imageItem extends uploadItem {
  id?: string
  category?: number
}
