export interface AccountProfile {
  id: number
  userName: string
  fullName: string
  mobile1: string | null
  mobile2: string | null
  tel: string | null
  roles: string[]
}

export interface UpdateAccountProfileRequest {
  fullName: string
  mobile1: string | null
  mobile2: string | null
  tel: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  success: boolean
}
