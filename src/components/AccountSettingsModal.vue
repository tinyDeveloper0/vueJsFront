<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NSpin,
  NTabPane,
  NTabs,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'

import { userApi } from '@/api/userApi'
import type { AccountProfile } from '@/types/account'

const props = defineProps<{
  show: boolean
  initialTab: 'profile' | 'password'
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'profile-updated': [profile: AccountProfile]
}>()

const message = useMessage()
const activeTab = ref<'profile' | 'password'>('profile')
const profileFormRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)
const profileLoading = ref(false)
const profileSaving = ref(false)
const passwordSaving = ref(false)
const profileError = ref('')
const passwordError = ref('')
const profile = ref<AccountProfile | null>(null)

const profileForm = reactive({
  fullName: '',
  mobile1: '',
  mobile2: '',
  tel: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const profileRules: FormRules = {
  fullName: {
    required: true,
    message: 'Full name is required.',
    trigger: ['blur', 'input'],
  },
}

const passwordRules: FormRules = {
  currentPassword: {
    required: true,
    message: 'Current password is required.',
    trigger: ['blur', 'input'],
  },
  newPassword: [
    {
      required: true,
      message: 'New password is required.',
      trigger: ['blur', 'input'],
    },
    {
      min: 8,
      message: 'New password must contain at least 8 characters.',
      trigger: ['blur', 'input'],
    },
  ],
  confirmPassword: {
    validator: (_rule, value: string) => value === passwordForm.newPassword,
    message: 'Passwords do not match.',
    trigger: ['blur', 'input'],
  },
}

watch(
  () => [props.show, props.initialTab] as const,
  ([visible, tab]) => {
    if (!visible) return

    activeTab.value = tab
    profileError.value = ''
    passwordError.value = ''
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    void loadProfile()
  },
)

async function loadProfile(): Promise<void> {
  profileLoading.value = true
  profileError.value = ''

  try {
    const response = await userApi.getAccountProfile()
    profile.value = response
    profileForm.fullName = response.fullName
    profileForm.mobile1 = response.mobile1 ?? ''
    profileForm.mobile2 = response.mobile2 ?? ''
    profileForm.tel = response.tel ?? ''
    emit('profile-updated', response)
  } catch (cause) {
    profileError.value = 'Unable to load your profile.'
    console.error(cause)
  } finally {
    profileLoading.value = false
  }
}

async function saveProfile(): Promise<void> {
  profileError.value = ''

  try {
    await profileFormRef.value?.validate()
  } catch {
    return
  }

  profileSaving.value = true
  try {
    const response = await userApi.updateAccountProfile({
      fullName: profileForm.fullName.trim(),
      mobile1: profileForm.mobile1.trim() || null,
      mobile2: profileForm.mobile2.trim() || null,
      tel: profileForm.tel.trim() || null,
    })
    profile.value = response
    emit('profile-updated', response)
    message.success('Profile updated.')
  } catch (cause) {
    profileError.value = 'Unable to update your profile.'
    console.error(cause)
  } finally {
    profileSaving.value = false
  }
}

async function changePassword(): Promise<void> {
  passwordError.value = ''

  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  passwordSaving.value = true
  try {
    await userApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    message.success('Password changed.')
  } catch (cause) {
    passwordError.value =
      cause instanceof Error ? cause.message : 'Unable to change your password.'
    console.error(cause)
  } finally {
    passwordSaving.value = false
  }
}

function close(): void {
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="Account settings"
    class="account-settings-modal"
    style="width: min(620px, 94vw)"
    :mask-closable="!profileSaving && !passwordSaving"
    :closable="!profileSaving && !passwordSaving"
    @update:show="emit('update:show', $event)"
  >
    <n-tabs v-model:value="activeTab" type="line">
      <n-tab-pane name="profile" tab="Personal profile">
        <n-alert v-if="profileError" type="error" class="settings-alert">
          {{ profileError }}
        </n-alert>

        <n-spin :show="profileLoading">
          <n-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-placement="top"
          >
            <n-form-item label="Username">
              <n-input :value="profile?.userName ?? ''" disabled />
            </n-form-item>
            <n-form-item label="Roles">
              <n-input :value="profile?.roles.join(', ') ?? ''" disabled />
            </n-form-item>
            <n-form-item label="Full name" path="fullName">
              <n-input v-model:value="profileForm.fullName" maxlength="50" />
            </n-form-item>
            <div class="contact-grid">
              <n-form-item label="Mobile 1">
                <n-input v-model:value="profileForm.mobile1" maxlength="15" />
              </n-form-item>
              <n-form-item label="Mobile 2">
                <n-input v-model:value="profileForm.mobile2" maxlength="15" />
              </n-form-item>
            </div>
            <n-form-item label="Telephone">
              <n-input v-model:value="profileForm.tel" maxlength="15" />
            </n-form-item>
          </n-form>
        </n-spin>

        <n-space justify="end">
          <n-button @click="close">Close</n-button>
          <n-button type="primary" :loading="profileSaving" @click="saveProfile">
            Save profile
          </n-button>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="password" tab="Change password">
        <n-alert v-if="passwordError" type="error" class="settings-alert">
          {{ passwordError }}
        </n-alert>

        <n-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-placement="top"
        >
          <n-form-item label="Current password" path="currentPassword">
            <n-input
              v-model:value="passwordForm.currentPassword"
              type="password"
              show-password-on="click"
              autocomplete="current-password"
            />
          </n-form-item>
          <n-form-item label="New password" path="newPassword">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              show-password-on="click"
              autocomplete="new-password"
            />
          </n-form-item>
          <n-form-item label="Confirm new password" path="confirmPassword">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              show-password-on="click"
              autocomplete="new-password"
            />
          </n-form-item>
        </n-form>

        <n-space justify="end">
          <n-button @click="close">Close</n-button>
          <n-button type="primary" :loading="passwordSaving" @click="changePassword">
            Change password
          </n-button>
        </n-space>
      </n-tab-pane>
    </n-tabs>
  </n-modal>
</template>

<style scoped>
.settings-alert {
  margin-bottom: 14px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.contact-grid :deep(.n-form-item) {
  margin-bottom: 0;
}

@media (max-width: 520px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
