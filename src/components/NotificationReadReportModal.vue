<script setup lang="ts">
import { h, reactive, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NDataTable,
  NEmpty,
  NInput,
  NModal,
  NPagination,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  type DataTableColumns,
} from 'naive-ui'

import { notificationApi } from '@/api/notificationApi'
import type {
  AdminNotificationItem,
  NotificationReadReportResponse,
  NotificationReadReportUser,
} from '@/types/notification'

const props = defineProps<{
  show: boolean
  notification: AdminNotificationItem | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const loading = ref(false)
const error = ref('')
const report = ref<NotificationReadReportResponse | null>(null)
const page = ref(1)
const pageSize = ref(20)
const filter = reactive({
  search: '',
  status: 'all' as 'all' | 'read' | 'unread',
})

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Read', value: 'read' },
  { label: 'Unread', value: 'unread' },
]

const columns: DataTableColumns<NotificationReadReportUser> = [
  {
    title: 'Full Name',
    key: 'fullName',
  },
  {
    title: 'Username',
    key: 'userName',
  },
  {
    title: 'Status',
    key: 'isRead',
    render(row) {
      return h(
        NTag,
        { type: row.isRead ? 'success' : 'warning', size: 'small' },
        { default: () => (row.isRead ? 'Read' : 'Unread') },
      )
    },
  },
  {
    title: 'Read At',
    key: 'readAt',
    render(row) {
      return row.readAt ? new Date(row.readAt).toLocaleString() : '—'
    },
  },
]

watch(
  () => [props.show, props.notification?.id] as const,
  ([visible]) => {
    if (!visible) return
    page.value = 1
    filter.search = ''
    filter.status = 'all'
    void loadReport()
  },
)

async function loadReport(): Promise<void> {
  if (!props.notification) return

  loading.value = true
  error.value = ''

  try {
    report.value = await notificationApi.getReadReport(props.notification.id, {
      search: filter.search.trim(),
      isRead: filter.status === 'all' ? null : filter.status === 'read',
      page: page.value,
      perPage: pageSize.value,
    })
  } catch (cause) {
    error.value = 'Unable to load the read report.'
    console.error(cause)
  } finally {
    loading.value = false
  }
}

function search(): void {
  page.value = 1
  void loadReport()
}

function handlePageChange(value: number): void {
  page.value = value
  void loadReport()
}

function handlePageSizeChange(value: number): void {
  pageSize.value = value
  page.value = 1
  void loadReport()
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="notification ? `Read Report — ${notification.title}` : 'Read Report'"
    class="notification-report-modal"
    style="width: min(940px, 96vw)"
    @update:show="emit('update:show', $event)"
  >
    <n-alert v-if="error" type="error" class="report-error">{{ error }}</n-alert>

    <n-spin :show="loading">
      <div v-if="report" class="report-summary">
        <div class="summary-item">
          <span>Total recipients</span>
          <strong>{{ report.totalRecipients }}</strong>
        </div>
        <div class="summary-item">
          <span>Read</span>
          <strong>{{ report.readCount }}</strong>
        </div>
        <div class="summary-item">
          <span>Unread</span>
          <strong>{{ report.unreadCount }}</strong>
        </div>
        <div class="summary-item">
          <span>Read percentage</span>
          <strong>{{ report.readPercentage }}%</strong>
        </div>
      </div>

      <n-space class="report-filters" align="end">
        <n-input
          v-model:value="filter.search"
          clearable
          placeholder="Search name or username"
          @keyup.enter="search"
        />
        <n-select
          v-model:value="filter.status"
          :options="statusOptions"
          class="status-select"
          @update:value="search"
        />
        <n-button type="primary" :loading="loading" @click="search">Search</n-button>
      </n-space>

      <n-data-table
        v-if="report?.items.length"
        remote
        striped
        :columns="columns"
        :data="report.items"
        :loading="loading"
        :row-key="(row: NotificationReadReportUser) => row.userId"
        :scroll-x="650"
      />
      <n-empty
        v-else-if="!loading"
        description="No recipients match this filter"
        class="report-empty"
      />
    </n-spin>

    <template #footer>
      <n-pagination
        :page="page"
        :page-size="pageSize"
        :item-count="report?.totalCount ?? 0"
        :page-sizes="[10, 20, 50]"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </template>
  </n-modal>
</template>

<style scoped>
.report-error {
  margin-bottom: 12px;
}

.report-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 6px;
}

.summary-item strong {
  font-size: 20px;
}

.report-filters {
  margin-bottom: 16px;
}

.status-select {
  width: 150px;
}

.report-empty {
  padding: 32px 0;
}

@media (max-width: 700px) {
  .report-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
