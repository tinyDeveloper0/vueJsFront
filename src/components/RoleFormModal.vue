<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  type FormInst,
  type FormRules,
} from 'naive-ui'

import { accessTypes } from '@/enums/accessTypes'
import { roleApi } from '@/api/roleApi'
import type { Permission, Role, RoleFormModel } from '@/types/role'

const props = defineProps<{
  show: boolean
  role: Role | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [payload: RoleFormModel]
}>()

const formRef = ref<FormInst | null>(null)
const permissionsLoading = ref(false)
const permissions = ref<Permission[]>([])
const permissionSearch = ref('')

const form = reactive<RoleFormModel>({
  id: 0,
  title: '',
  accessType: 0,
  description: '',
  permissionIds: [],
  isEdit: false,
})

const isEdit = computed(() => form.isEdit)
const title = computed(() => (isEdit.value ? 'Edit Role' : 'Add Role'))

const permissionOptions = computed(() => {
  const keyword = permissionSearch.value.trim().toLowerCase()

  return permissions.value
    .filter((item) => {
      if (!keyword) return true

      const titleText = item.title?.toLowerCase() ?? ''
      const nameText = item.name?.toLowerCase() ?? ''
      const descriptionText = item.description?.toLowerCase() ?? ''

      return (
        titleText.includes(keyword) ||
        nameText.includes(keyword) ||
        descriptionText.includes(keyword)
      )
    })
    .map((item) => ({
      label: item.title,
      value: item.id,
    }))
})

const selectedPermissionCount = computed(() => form.permissionIds.length)

const rules: FormRules = {
  title: {
    required: true,
    message: 'Title is required',
    trigger: ['blur', 'input'],
  },
  accessType: {
    required: true,
    type: 'number',
    message: 'Access type is required',
    trigger: ['blur', 'change'],
  },
}

function resetForm() {
  form.id = 0
  form.title = ''
  form.accessType = 0
  form.description = ''
  form.permissionIds = []
  form.isEdit = false
  permissionSearch.value = ''
}

function fillFromRole(role: Role) {
  form.id = role.id
  form.title = role.title ?? ''
  form.accessType = role.accessType ?? 0
  form.description = role.description ?? ''
  form.permissionIds = [...(role.permissionIds ?? [])]
  form.isEdit = true
  permissionSearch.value = ''
}

async function loadPermissions() {
  if (permissions.value.length > 0) return

  permissionsLoading.value = true

  try {
    permissions.value = await roleApi.getPermissions()
  } catch (e) {
    console.error(e)
    permissions.value = []
  } finally {
    permissionsLoading.value = false
  }
}

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return

    await loadPermissions()

    if (props.role) {
      fillFromRole(props.role)
    } else {
      resetForm()
    }
  },
)

onMounted(() => {
  void loadPermissions()
})

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
    permissionIds: [...form.permissionIds],
  })
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    class="role-form-modal"
    style="width: min(560px, 94vw)"
    :mask-closable="!saving"
    :closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      size="small"
      label-placement="top"
      require-mark-placement="right-hanging"
    >
      <div class="form-grid">
        <n-form-item label="Title" path="title">
          <n-input v-model:value="form.title" placeholder="Title" :disabled="saving" />
        </n-form-item>

        <n-form-item label="Access Type" path="accessType">
          <n-select
            v-model:value="form.accessType"
            :options="[...accessTypes]"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item class="full-span" label="Description" path="description">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Description"
            :rows="2"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item class="full-span" path="permissionIds">
          <template #label>
            <div class="permissions-label">
              <span>Permissions</span>
              <span class="permissions-count">{{ selectedPermissionCount }} selected</span>
            </div>
          </template>

          <n-spin :show="permissionsLoading" class="full-width">
            <div class="permissions-panel">
              <n-input
                v-model:value="permissionSearch"
                clearable
                placeholder="Search permissions..."
                :disabled="saving"
              />

              <n-checkbox-group
                v-model:value="form.permissionIds"
                class="permission-scroll"
                :disabled="saving"
              >
                <div class="permission-list">
                  <n-checkbox
                    v-for="option in permissionOptions"
                    :key="option.value"
                    :value="option.value"
                    :label="option.label"
                  />
                </div>
              </n-checkbox-group>

              <div
                v-if="!permissionsLoading && permissionOptions.length === 0"
                class="empty-hint"
              >
                {{
                  permissionSearch.trim()
                    ? 'No permissions match your search.'
                    : 'No permissions found.'
                }}
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

.form-grid :deep(.n-form-item) {
  margin-bottom: 8px;
}

.full-span {
  grid-column: 1 / -1;
}

.full-width {
  width: 100%;
}

.permissions-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.permissions-count {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.permissions-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.permission-scroll {
  max-height: 220px;
  overflow-y: auto;
  padding: 10px 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  box-sizing: border-box;
}

.permission-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  width: 100%;
}

.empty-hint {
  color: #999;
  font-size: 13px;
}

@media (max-width: 600px) {
  .form-grid,
  .permission-list {
    grid-template-columns: 1fr;
  }

  .permission-scroll {
    max-height: 180px;
  }
}
</style>

<style>
.role-form-modal.n-card {
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.role-form-modal .n-card__content {
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

.role-form-modal .n-card__footer {
  padding-top: 8px;
}
</style>
