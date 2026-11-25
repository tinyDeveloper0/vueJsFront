<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  type FormInst,
  type FormRules,
  type SelectOption,
} from 'naive-ui'

import { roleApi } from '@/api/roleApi'
import { userApi } from '@/api/userApi'
import {
  NotificationPriority,
  NotificationTargetType,
  NotificationType,
} from '@/enums/notification'
import type { AdminNotificationItem, SaveNotificationRequest } from '@/types/notification'

const props = defineProps<{
  show: boolean
  notification: AdminNotificationItem | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [payload: SaveNotificationRequest]
}>()

const formRef = ref<FormInst | null>(null)
const loadingTargets = ref(false)
const loadError = ref('')
const validationError = ref('')
const userOptions = ref<SelectOption[]>([])
const roleOptions = ref<SelectOption[]>([])

const form = reactive({
  title: '',
  body: '',
  notificationType: NotificationType.Information,
  priority: NotificationPriority.Normal,
  targetType: NotificationTargetType.AllUsers,
  targetIds: [] as number[],
  expiresAt: null as number | null,
})

const isEdit = computed(() => props.notification !== null)
const modalTitle = computed(() => (isEdit.value ? 'Edit Notification' : 'Create Notification'))

const typeOptions: SelectOption[] = [
  { label: 'اطلاع‌رسانی', value: NotificationType.Information },
  { label: 'هشدار', value: NotificationType.Warning },
  { label: 'مهم', value: NotificationType.Important },
]

const priorityOptions: SelectOption[] = [
  { label: 'عادی', value: NotificationPriority.Normal },
  { label: 'مهم', value: NotificationPriority.Important },
  { label: 'بحرانی', value: NotificationPriority.Critical },
]

const targetTypeOptions: SelectOption[] = [
  { label: 'همه کاربران', value: NotificationTargetType.AllUsers },
  { label: 'کاربران انتخابی', value: NotificationTargetType.SpecificUsers },
  { label: 'نقش‌های انتخابی', value: NotificationTargetType.SpecificRoles },
]

const rules: FormRules = {
  title: {
    required: true,
    message: 'Title is required',
    trigger: ['blur', 'input'],
  },
  body: {
    required: true,
    message: 'Notification text is required',
    trigger: ['blur', 'input'],
  },
}

const recipientOptions = computed(() =>
  form.targetType === NotificationTargetType.SpecificUsers ? userOptions.value : roleOptions.value,
)

const recipientLabel = computed(() =>
  form.targetType === NotificationTargetType.SpecificUsers ? 'Users' : 'Roles',
)

function resetForm(): void {
  form.title = ''
  form.body = ''
  form.notificationType = NotificationType.Information
  form.priority = NotificationPriority.Normal
  form.targetType = NotificationTargetType.AllUsers
  form.targetIds = []
  form.expiresAt = null
  validationError.value = ''
  loadError.value = ''
}

function fillForm(notification: AdminNotificationItem): void {
  form.title = notification.title
  form.body = notification.body
  form.notificationType = notification.notificationType
  form.priority = notification.priority
  form.targetType = notification.targetType
  form.targetIds = [...notification.targetIds]
  form.expiresAt = notification.expiresAt ? new Date(notification.expiresAt).getTime() : null
}

async function loadRecipients(): Promise<void> {
  loadingTargets.value = true
  loadError.value = ''

  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      userApi.getUsers({
        userName: '',
        fullName: '',
        sort: '',
        order: '',
        page: 1,
        perPage: 1000,
      }),
      roleApi.getRoles({
        title: '',
        sort: '',
        order: '',
        page: 1,
        perPage: 1000,
      }),
    ])

    userOptions.value = usersResponse.items.map((user) => ({
      label: `${user.fullName} (${user.userName})`,
      value: user.id,
    }))
    roleOptions.value = rolesResponse.items.map((role) => ({
      label: role.title,
      value: role.id,
    }))
  } catch (cause) {
    loadError.value = 'Unable to load users and roles.'
    console.error(cause)
  } finally {
    loadingTargets.value = false
  }
}

watch(
  () => props.show,
  async (visible) => {
    if (!visible) return

    resetForm()
    await loadRecipients()

    if (props.notification) {
      fillForm(props.notification)
    }
  },
)

function handleTargetTypeChange(value: number): void {
  form.targetType = value as NotificationTargetType
  form.targetIds = []
}

function close(): void {
  emit('update:show', false)
}

async function handleSave(): Promise<void> {
  validationError.value = ''

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  if (
    form.targetType !== NotificationTargetType.AllUsers &&
    form.targetIds.length === 0
  ) {
    validationError.value = 'Select at least one recipient.'
    return
  }

  emit('save', {
    title: form.title.trim(),
    body: form.body.trim(),
    notificationType: form.notificationType,
    priority: form.priority,
    targetType: form.targetType,
    targetIds:
      form.targetType === NotificationTargetType.AllUsers ? [] : [...form.targetIds],
    expiresAt: form.expiresAt === null ? null : new Date(form.expiresAt).toISOString(),
  })
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="modalTitle"
    class="notification-form-modal"
    style="width: min(620px, 94vw)"
    :mask-closable="!saving"
    :closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <n-alert v-if="loadError" type="error" class="form-alert">{{ loadError }}</n-alert>
    <n-alert v-if="validationError" type="error" class="form-alert">
      {{ validationError }}
    </n-alert>

    <n-spin :show="loadingTargets">
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="Title" path="title">
          <n-input
            v-model:value="form.title"
            maxlength="200"
            show-count
            placeholder="Notification title"
            :disabled="saving"
          />
        </n-form-item>

        <n-form-item label="Text" path="body">
          <n-input
            v-model:value="form.body"
            type="textarea"
            :rows="4"
            placeholder="Notification text"
            :disabled="saving"
          />
        </n-form-item>

        <div class="form-grid">
          <n-form-item label="Notification Type" path="notificationType">
            <n-select
              v-model:value="form.notificationType"
              :options="typeOptions"
              :disabled="saving"
            />
          </n-form-item>

          <n-form-item label="Priority" path="priority">
            <n-select
              v-model:value="form.priority"
              :options="priorityOptions"
              :disabled="saving"
            />
          </n-form-item>

          <n-form-item label="Audience" path="targetType">
            <n-select
              :value="form.targetType"
              :options="targetTypeOptions"
              :disabled="saving"
              @update:value="handleTargetTypeChange"
            />
          </n-form-item>

          <n-form-item label="Expiration (optional)" path="expiresAt">
            <n-date-picker
              v-model:value="form.expiresAt"
              type="datetime"
              clearable
              class="full-width"
              :disabled="saving"
            />
          </n-form-item>
        </div>

        <n-form-item
          v-if="form.targetType !== NotificationTargetType.AllUsers"
          :label="recipientLabel"
          path="targetIds"
        >
          <n-select
            v-model:value="form.targetIds"
            multiple
            filterable
            clearable
            :options="recipientOptions"
            :placeholder="`Select ${recipientLabel.toLowerCase()}`"
            :disabled="saving || loadingTargets"
          />
        </n-form-item>
      </n-form>
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button :disabled="saving" @click="close">Cancel</n-button>
        <n-button type="primary" :loading="saving" @click="handleSave">Save</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.form-alert {
  margin-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
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
