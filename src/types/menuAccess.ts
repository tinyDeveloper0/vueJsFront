export interface MenuAccessItem {
  id: number
  parentId: number | null
  title: string
  route: string | null
  icon: string | null
  position: number | null
  children: MenuAccessItem[]
}

export interface RoleMenuAccessResponse {
  menus: MenuAccessItem[]
  selectedMenuIds: number[]
}

export interface MenuUpdateItem {
  id: number
  parentId: number | null
  icon: string | null
  position: number
}

export interface SaveRoleMenuAccessRequest {
  roleId: number
  selectedMenuIds: number[]
  menus: MenuUpdateItem[]
}
