import { apiFetch } from './client'
import type { LoginRequest, LoginResponse, MenuItem } from '@/types/auth'
import { apiList } from '@/enums/apiList'
export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(apiList.Authenticate, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getUserMenus(): Promise<MenuItem[]> {
  return apiFetch<MenuItem[]>(apiList.UserMenus, {
    method: 'POST',
  })
}
