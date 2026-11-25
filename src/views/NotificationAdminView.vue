<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
  type SelectOption,
} from 'naive-ui'

import { notificationApi } from '@/api/notificationApi'
import NotificationFormModal from '@/components/NotificationFormModal.vue'
import NotificationReadReportModal from '@/components/NotificationReadReportModal.vue'
import {
  getNotificationPriorityDetails,
  getNotificationTypeDetails,
  NotificationPriority,
  NotificationTargetType,
  NotificationType,
} from '@/enums/notification'
import type {
  AdminNotificationItem,
  NotificationAdminFilter,
  NotificationSaveResponse,
  SaveNotificationRequest,
} from '@/types/notification'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notifications = ref<AdminNotificationItem[]>([])
const totalCount = ref(0)
const showForm = ref(false)
const editingNotification = ref<AdminNotificationItem | null>(null)
const showReport = ref(false)
const reportNotification = ref<AdminNotificationItem | null>(null)

const filter = reactive<NotificationAdminFilter>({
  search: '',
  notificationType: null,
  priority: null,
  targetType: null,
  isActive: null,
  createdAtFrom: null,
  createdAtTo: null,
  page: 1,
  perPage: 20,
})
const createdAtRange = ref<[number, number] | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
})

const typeFilterOptions: SelectOption[] = [
  { label: 'All types', value: 'all' },
  { label: 'اطلاع‌رسانی', value: NotificationType.Information },
  { label: 'هشدار', value: NotificationType.Warning },
  { label: 'مهم', value: NotificationType.Important },
]

const priorityFilterOptions: SelectOption[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'عادی', value: NotificationPriority.Normal },
  { label: 'مهم', value: NotificationPriority.Important },
  { label: 'بحرانی', value: NotificationPriority.Critical },
]

const targetFilterOptions: SelectOption[] = [
  { label: 'All audiences', value: 'all' },
  { label: 'All users', value: NotificationTargetType.AllUsers },
  { label: 'Specific users', value: NotificationTargetType.SpecificUsers },
  { label: 'Specific roles', value: NotificationTargetType.SpecificRoles },
]

const activeFilterOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')

function updateTypeFilter(value: string | number | null): void {
  filter.notificationType = value === 'all' || value === null ? null : Number(value)
}

function updatePriorityFilter(value: string | number | null): void {
  filter.priority = value === 'all' || value === null ? null : Number(value)
}

function updateTargetFilter(value: string | number | null): void {
  filter.targetType = value === 'all' || value === null ? null : Number(value)
}

function toLocalDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number, length = 2) => String(value).padStart(length, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    pad(date.getMilliseconds(), 3)
}

function updateCreatedAtRange(value: number | [number, number] | null): void {
  if (!Array.isArray(value) || value.length !== 2) {
    createdAtRange.value = null
    filter.createdAtFrom = null
    filter.createdAtTo = null
    return
  }

  createdAtRange.value = [value[0], value[1]]
  filter.createdAtFrom = toLocalDateTime(value[0])
  filter.createdAtTo = toLocalDateTime(value[1])
}

function targetTypeLabel(targetType: number): string {
  switch (targetType) {
    case NotificationTargetType.AllUsers:
      return 'All users'
    case NotificationTargetType.SpecificUsers:
      return 'Specific users'
    case NotificationTargetType.SpecificRoles:
      return 'Specific roles'
    default:
      return 'Unknown'
  }
}

async function loadData(): Promise<void> {
  loading.value = true
  error.value = ''

  filter.isActive =
    activeFilter.value === 'all' ? null : activeFilter.value === 'active'

  try {
    const response = await notificationApi.getAdminNotifications(filter)
    notifications.value = response.items
    totalCount.value = response.totalCount
    pagination.itemCount = response.totalCount
  } catch (cause) {
    notifications.value = []
    totalCount.value = 0
    pagination.itemCount = 0
    error.value = 'Unable to load notifications.'
    console.error(cause)
  } finally {
    loading.value = false
  }
}

function search(): void {
  filter.page = 1
  pagination.page = 1
  void loadData()
}

function handlePageChange(page: number): void {
  filter.page = page
  pagination.page = page
  void loadData()
}

function handlePageSizeChange(pageSize: number): void {
  filter.perPage = pageSize
  filter.page = 1
  pagination.pageSize = pageSize
  pagination.page = 1
  void loadData()
}

function openCreate(): void {
  error.value = ''
  editingNotification.value = null
  showForm.value = true
}

function openEdit(notification: AdminNotificationItem): void {
  error.value = ''
  editingNotification.value = notification
  showForm.value = true
}

function openReport(notification: AdminNotificationItem): void {
  reportNotification.value = notification
  showReport.value = true
}

async function saveNotification(payload: SaveNotificationRequest): Promise<void> {
  saving.value = true
  error.value = ''

  try {
    let response: NotificationSaveResponse
    if (editingNotification.value) {
      response = await notificationApi.updateNotification(editingNotification.value.id, payload)
      message.success('Notification updated successfully.')
    } else {
      response = await notificationApi.createNotification(payload)
      if (response.realtimeSent) {
        message.success('Notification created and delivered.')
      } else {
        message.warning('Notification created, but live delivery could not be confirmed.')
      }
    }

    showForm.value = false
    editingNotification.value = null
    await loadData()
  } catch (cause) {
    error.value = 'Unable to save the notification.'
    message.error(error.value)
    console.error(cause)
  } finally {
    saving.value = false
  }
}

async function toggleActive(notification: AdminNotificationItem): Promise<void> {
  error.value = ''

  try {
    await notificationApi.setNotificationActive(notification.id, !notification.isActive)
    message.success(notification.isActive ? 'Notification deactivated.' : 'Notification activated.')
    await loadData()
  } catch (cause) {
    error.value = 'Unable to change notification status.'
    message.error(error.value)
    console.error(cause)
  }
}

const columns: DataTableColumns<AdminNotificationItem> = [
  {
    title: 'Title',
    key: 'title',
    ellipsis: { tooltip: true },
    width: 220,
  },
  {
    title: 'Type',
    key: 'notificationType',
    width: 150,
    render(row) {
      const details = getNotificationTypeDetails(row.notificationType)
      return h(NTag, { type: details.tagType, size: 'small' }, { default: () => details.label })
    },
  },
  {
    title: 'Priority',
    key: 'priority',
    width: 130,
    render(row) {
      const details = getNotificationPriorityDetails(row.priority)
      return h(NTag, { type: details.tagType, size: 'small' }, { default: () => details.label })
    },
  },
  {
    title: 'Audience',
    key: 'targetType',
    width: 140,
    render(row) {
      return targetTypeLabel(row.targetType)
    },
  },
  {
    title: 'Recipients',
    key: 'recipientCount',
    width: 100,
  },
  {
    title: 'Status',
    key: 'isActive',
    width: 120,
    render(row) {
      const label = row.isExpired ? 'Expired' : row.isActive ? 'Active' : 'Inactive'
      const type = row.isExpired ? 'warning' : row.isActive ? 'success' : 'default'
      return h(NTag, { type, size: 'small' }, { default: () => label })
    },
  },
  {
    title: 'Created At',
    key: 'createdAt',
    width: 170,
    render(row) {
      return row.createdAtShamsi
    },
  },
  {
    title: 'Expires',
    key: 'expiresAt',
    width: 170,
    render(row) {
      return row.expiresAtShamsi ?? '—'
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 240,
    fixed: 'right',
    render(row) {
      return h(
        NSpace,
        { size: 6, wrap: false },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', onClick: () => openEdit(row) },
              { default: () => 'Edit' },
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.isActive ? 'warning' : 'success',
                disabled: row.isExpired && !row.isActive,
                onClick: () => toggleActive(row),
              },
              { default: () => (row.isActive ? 'Deactivate' : 'Activate') },
            ),
            h(
              NButton,
              { size: 'small', type: 'info', onClick: () => openReport(row) },
              { default: () => 'Read report' },
            ),
          ],
        },
      )
    },
  },
]

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div class="notification-admin-page">
    <n-alert v-if="error" type="error" class="page-error">{{ error }}</n-alert>

    <n-card title="Notification Management">
      <template #header-extra>
        <n-button type="primary" @click="openCreate">Create notification</n-button>
      </template>

      <n-form :model="filter" label-placement="top" @submit.prevent="search">
        <div class="filter-grid">
          <n-form-item label="Search">
            <n-input
              v-model:value="filter.search"
              clearable
              placeholder="Title or text"
              @keyup.enter="search"
            />
          </n-form-item>
          <n-form-item label="Type">
            <n-select
              :value="filter.notificationType ?? 'all'"
              :options="typeFilterOptions"
              @update:value="updateTypeFilter"
            />
          </n-form-item>
          <n-form-item label="Priority">
            <n-select
              :value="filter.priority ?? 'all'"
              :options="priorityFilterOptions"
              @update:value="updatePriorityFilter"
            />
          </n-form-item>
          <n-form-item label="Audience">
            <n-select
              :value="filter.targetType ?? 'all'"
              :options="targetFilterOptions"
              @update:value="updateTargetFilter"
            />
          </n-form-item>
          <n-form-item label="Status">
            <n-select v-model:value="activeFilter" :options="activeFilterOptions" />
          </n-form-item>
          <n-form-item label="Creation date/time range">
            <n-date-picker
              type="datetimerange"
              clearable
              format="yyyy-MM-dd HH:mm:ss"
              :value="createdAtRange"
              start-placeholder="Start date/time"
              end-placeholder="End date/time"
              @update:value="updateCreatedAtRange"
            />
          </n-form-item>
          <div class="search-action">
            <n-button type="info" :loading="loading" @click="search">Search</n-button>
          </div>
        </div>
      </n-form>

      <n-data-table
        remote
        striped
        :columns="columns"
        :data="notifications"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: AdminNotificationItem) => row.id"
        :scroll-x="1450"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <NotificationFormModal
      v-model:show="showForm"
      :notification="editingNotification"
      :saving="saving"
      @save="saveNotification"
    />

    <NotificationReadReportModal
      v-model:show="showReport"
      :notification="reportNotification"
    />
  </div>
</template>

<style scoped>
.notification-admin-page {
  width: 100%;
}

.page-error {
  margin-bottom: 16px;
}

.filter-grid {
  display: grid;
  grid-template-columns:
    minmax(200px, 2fr) repeat(4, minmax(130px, 1fr)) minmax(240px, 1.5fr) auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.filter-grid :deep(.n-form-item) {
  margin-bottom: 0;
}

.search-action {
  padding-bottom: 4px;
}

@media (max-width: 1000px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
