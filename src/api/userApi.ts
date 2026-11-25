import { apiFetch } from './client'
import { apiList } from '@/enums/apiList'
import type {
  AccountProfile,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateAccountProfileRequest,
} from '@/types/account'
import type { User, UserFilter, UserFormModel, UserListResponse } from '@/types/user'

export const userApi = {
  getAccountProfile(): Promise<AccountProfile> {
    return apiFetch<AccountProfile>(apiList.AccountProfile, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  updateAccountProfile(payload: UpdateAccountProfileRequest): Promise<AccountProfile> {
    return apiFetch<AccountProfile>(apiList.UpdateAccountProfile, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiFetch<ChangePasswordResponse>(apiList.ChangePassword, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

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
