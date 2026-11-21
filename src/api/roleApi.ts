import { apiFetch } from './client'
import { apiList } from '@/enums/apiList'
import type { Permission, Role, RoleFilter, RoleFormModel, RoleListResponse } from '@/types/role'
import type { RoleMenuAccessResponse, SaveRoleMenuAccessRequest } from '@/types/menuAccess'

export const roleApi = {
  getRoles(filter: RoleFilter): Promise<RoleListResponse> {
    return apiFetch<RoleListResponse>(apiList.RoleList, {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  },

  addEditRole(role: RoleFormModel): Promise<number> {
    return apiFetch<number>(apiList.AddEditRole, {
      method: 'POST',
      body: JSON.stringify(role),
    })
  },

  deleteRole(role: Role): Promise<number> {
    return apiFetch<number>(apiList.DeleteRole, {
      method: 'POST',
      body: JSON.stringify(role),
    })
  },

  getPermissions(): Promise<Permission[]> {
    return apiFetch<Permission[]>(apiList.PermissionList, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  getRoleMenuAccess(roleId: number): Promise<RoleMenuAccessResponse> {
    return apiFetch<RoleMenuAccessResponse>(apiList.RoleMenuAccess, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    })
  },

  saveRoleMenuAccess(payload: SaveRoleMenuAccessRequest): Promise<number> {
    return apiFetch<number>(apiList.SaveRoleMenuAccess, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
