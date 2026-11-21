<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  type FormInst,
  type FormRules,
} from 'naive-ui'

import { userTypes } from '@/enums/userTypes'
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
  isEdit: false,
  isGod: false,
})

const isEdit = computed(() => form.isEdit)
const title = computed(() => (isEdit.value ? 'Edit User' : 'Add User'))

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
  form.isEdit = false
  form.isGod = false
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
  form.isEdit = true
  form.isGod = user.isGod ?? false
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) return

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
      :model="form"
      :rules="rules"
      size="small"
      label-placement="top"
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

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
.user-form-modal.n-card {
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.user-form-modal .n-card__content {
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

.user-form-modal .n-card__footer {
  padding-top: 8px;
}
</style>
