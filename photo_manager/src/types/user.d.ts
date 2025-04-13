export interface UserData {
  username: string
  password: string
}

export interface UserInfo {
  avatar_url: string
  email: string
}

export interface UpdateUserInfo {
  avatar?: string
  password?: string
  email?: string
}

export interface RegisterData {
  username: string
  password: string
  email: string
}
