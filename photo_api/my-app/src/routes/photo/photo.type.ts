export interface loginInfo {
  username: string
  password: string
  token?: string
  avatar?: string
  email?: string
}

export interface imageItem {
  id: string
  name: string
  tags?: string[]
  source: string
  category: number
}
