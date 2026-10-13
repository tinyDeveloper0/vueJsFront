export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  id: number
  fullName: string
  username: string
  token: string
  error: string | null
  expires_at: string
}

export interface User {
  id: number
  fullName: string
  username: string
}

export interface MenuItem {
  id: number
  parentId: number | null
  title: string
  route: string | null
  icon: string | null
  position: number | null
  subMenus: MenuItem[]
}
