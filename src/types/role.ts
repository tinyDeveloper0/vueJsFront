export interface Role {
  id: number
  title: string
  accessType: number
  accessTypeStr: string
  description: string
  permissionIds: number[]
  permissionTitles: string
}

export interface RoleFormModel {
  id: number
  title: string
  accessType: number
  description: string
  permissionIds: number[]
  isEdit: boolean
}

export interface RoleFilter {
  title: string
  sort: string
  order: 'asc' | 'desc' | ''
  page: number
  perPage: number
}

export interface RoleListResponse {
  items: Role[]
  totalCount: number
}

export interface Permission {
  id: number
  name: string
  title: string
  description: string | null
}
