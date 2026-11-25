<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  NSwitch,
  type FormInst,
  type FormRules,
} from 'naive-ui'

import { roleApi } from '@/api/roleApi'
import { userTypes } from '@/enums/userTypes'
import type { Role } from '@/types/role'
import type { User, UserFormModel } from '@/types/user'

const props = defineProps<{
  show: boolean
  user: User | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [payload: UserFormModel]
}>()

const formRef = ref<FormInst | null>(null)
const rolesLoading = ref(false)
const roles = ref<Role[]>([])
const roleSearch = ref('')

const form = reactive<UserFormModel>({
  id: 0,
  userName: '',
  password: '',
  fullName: '',
  personeli: null,
  mobile1: '',
  mobile2: '',
  tel: '',
  userType: 0,
  isEnabled: true,
  description: '',
  roleIds: [],
  isEdit: false,
  isGod: false,
})

const isEdit = computed(() => form.isEdit)
const title = computed(() => (isEdit.value ? 'Edit User' : 'Add User'))

const roleOptions = computed(() => {
  const keyword = roleSearch.value.trim().toLowerCase()

  return roles.value
    .filter((item) => {
      if (!keyword) return true

      const titleText = item.title?.toLowerCase() ?? ''
      const accessText = item.accessTypeStr?.toLowerCase() ?? ''

      return titleText.includes(keyword) || accessText.includes(keyword)
    })
    .map((item) => ({
      label: item.title,
      value: item.id,
    }))
})

const selectedRoleCount = computed(() => form.roleIds.length)

const rules = computed<FormRules>(() => ({
  userName: {
    required: true,
    message: 'User name is required',
    trigger: ['blur', 'input'],
  },
  fullName: {
    required: true,
    message: 'Full name is required',
    trigger: ['blur', 'input'],
  },
  password: isEdit.value
    ? {
        required: false,
      }
    : {
        required: true,
        message: 'Password is required',
        trigger: ['blur', 'input'],
      },
}))

function resetForm() {
  form.id = 0
  form.userName = ''
  form.password = ''
  form.fullName = ''
  form.personeli = null
  form.mobile1 = ''
  form.mobile2 = ''
  form.tel = ''
  form.userType = 0
  form.isEnabled = true
  form.description = ''
  form.roleIds = []
  form.isEdit = false
  form.isGod = false
  roleSearch.value = ''
}

function fillFromUser(user: User) {
  form.id = user.id
  form.userName = user.userName ?? ''
  form.password = ''
  form.fullName = user.fullName ?? ''
  form.personeli =
    user.personeli === null || user.personeli === undefined || user.personeli === ''
      ? null
      : Number(user.personeli)
  form.mobile1 = user.mobile1 ?? ''
  form.mobile2 = user.mobile2 ?? ''
  form.tel = user.tel ?? ''
  form.userType = user.userType ?? 0
  form.isEnabled = user.isEnabled ?? true
  form.description = user.description ?? ''
  form.roleIds = [...(user.roleIds ?? [])]
  form.isEdit = true
  form.isGod = user.isGod ?? false
  roleSearch.value = ''
}

async function loadRoles() {
  if (roles.value.length > 0) return

  rolesLoading.value = true

  try {
    const response = await roleApi.getRoles({
      title: '',
      sort: '',
      order: '',
      page: 1,
      perPage: 1000,
    })
    roles.value = response.items ?? []
  } catch (e) {
    console.error(e)
    roles.value = []
  } finally {
    rolesLoading.value = false
  }
}

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return

    await loadRoles()

    if (props.user) {
      fillFromUser(props.user)
    } else {
      resetForm()
    }
  },
)

function close() {
  emit('update:show', false)
}

async function handleSave() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  emit('save', {
    ...form,
    roleIds: [...form.roleIds],
    // Backend only updates password when value is not null
    password: form.password?.trim() || null,
  })
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    class="user-form-modal"
    style="width: min(560px, 94vw)"
    :mask-closable="!saving"
    :closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <n-form
      ref="formRef"
      class="compact-form"
      :model="form"
      :rules="rules"
      size="small"
      label-placement="top"
      :show-require-mark="false"
      require-mark-placement="right-hanging"
    >
      <div class="form-grid">
        <n-form-item label="User Name" path="userName">
          <n-input v-model:value="form.userName" placeholder="User Name" :disabled="saving" />
        </n-form-item>

        <n-form-item label="Full Name" path="fullName">
          <n-input v-model:value="form.fullName" placeholder="Full Name" :disabled="saving" />
        </n-form-item>

        <n-form-item :label="isEdit ? 'Password (optional)' : 'Password'" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            :placeholder="isEdit ? 'Leave blank to keep' : 'Password'"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item label="Personeli" path="personeli">
          <n-input-number
            v-model:value="form.personeli"
            placeholder="Personeli"
            :show-button="false"
            class="full-width"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item label="Mobile 1" path="mobile1">
          <n-input v-model:value="form.mobile1" placeholder="Mobile 1" :disabled="saving" />
        </n-form-item>

        <n-form-item label="Mobile 2" path="mobile2">
          <n-input v-model:value="form.mobile2" placeholder="Mobile 2" :disabled="saving" />
        </n-form-item>

        <n-form-item label="Tel" path="tel">
          <n-input v-model:value="form.tel" placeholder="Tel" :disabled="saving" />
        </n-form-item>

        <n-form-item label="User Type" path="userType">
          <n-select
            v-model:value="form.userType"
            :options="[...userTypes]"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item label="Enabled" path="isEnabled">
          <n-switch v-model:value="form.isEnabled" size="small" :disabled="saving" />
        </n-form-item>

        <n-form-item class="full-span" label="Description" path="description">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Description"
            :rows="1"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item class="full-span" path="roleIds">
          <template #label>
            <div class="roles-label">
              <span>Roles</span>
              <span class="roles-count">{{ selectedRoleCount }} selected</span>
            </div>
          </template>

          <n-spin :show="rolesLoading" class="full-width">
            <div class="roles-panel">
              <n-input
                v-model:value="roleSearch"
                clearable
                placeholder="Search roles..."
                :disabled="saving"
              />

              <div class="role-scroll">
                <n-checkbox-group v-model:value="form.roleIds" :disabled="saving">
                  <div class="role-list">
                    <n-checkbox
                      v-for="option in roleOptions"
                      :key="option.value"
                      :value="option.value"
                      :label="option.label"
                    />
                  </div>
                </n-checkbox-group>
              </div>

              <div v-if="!rolesLoading && roleOptions.length === 0" class="empty-hint">
                {{ roleSearch.trim() ? 'No roles match your search.' : 'No roles found.' }}
              </div>
            </div>
          </n-spin>
        </n-form-item>
      </div>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button size="small" :disabled="saving" @click="close">Cancel</n-button>
        <n-button size="small" type="primary" :loading="saving" @click="handleSave">Save</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}

.compact-form :deep(.n-form-item) {
  margin-bottom: 4px;
}

.compact-form :deep(.n-form-item-label) {
  min-height: 0;
  padding: 0 0 1px;
  font-size: 12px;
  line-height: 1.2;
}

.compact-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 0;
  padding: 0;
  line-height: 1.2;
}

.full-span {
  grid-column: 1 / -1;
}

.full-width {
  width: 100%;
}

.roles-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.roles-count {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.roles-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.role-scroll {
  height: 132px;
  max-height: 132px;
  overflow-y: auto;
  padding: 6px 10px;
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 6px;
  box-sizing: border-box;
}

.role-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
  width: 100%;
}

.empty-hint {
  color: #999;
  font-size: 13px;
}

@media (max-width: 600px) {
  .form-grid,
  .role-list {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
.user-form-modal.n-card {
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-form-modal .n-card-header {
  padding: 10px 16px 6px;
}

.user-form-modal .n-card__content {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 4px 16px 6px;
}

.user-form-modal .n-card__footer {
  padding: 6px 16px 10px;
}
</style>
