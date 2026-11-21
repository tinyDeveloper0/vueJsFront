export interface User {
  id: number
  userName: string
  personeli: number | string | null
  fullName: string
  mobile1: string
  mobile2: string
  tel: string
  registerDate: string
  roleTitle: string
  userType: number
  userTypeStr: string
  description: string
  isEnabled: boolean
  password?: string | null
  isEdit?: boolean
  isGod?: boolean
}

export interface UserFormModel {
  id: number
  userName: string
  password: string | null
  fullName: string
  personeli: number | null
  mobile1: string
  mobile2: string
  tel: string
  userType: number
  isEnabled: boolean
  description: string
  isEdit: boolean
  isGod: boolean
}

export interface UserFilter {
  userName: string
  fullName: string
  sort: string
  order: 'asc' | 'desc' | ''
  page: number
  perPage: number
}

export interface UserListResponse {
  items: User[]
  totalCount: number
}
