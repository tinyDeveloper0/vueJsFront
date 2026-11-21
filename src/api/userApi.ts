import { apiFetch } from './client'
import { apiList } from '@/enums/apiList'
import type { User, UserFilter, UserFormModel, UserListResponse } from '@/types/user'

export const userApi = {
  getUsers(filter: UserFilter): Promise<UserListResponse> {
    return apiFetch<UserListResponse>(apiList.UserList, {
      method: 'POST',
      body: JSON.stringify(filter),
    })
  },

  addEditUser(user: UserFormModel): Promise<number> {
    return apiFetch<number>(apiList.AddEditUser, {
      method: 'POST',
      body: JSON.stringify(user),
    })
  },

  deleteUser(user: User): Promise<number> {
    return apiFetch<number>(apiList.DeleteUser, {
      method: 'POST',
      body: JSON.stringify(user),
    })
  },
}
