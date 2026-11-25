<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NPopconfirm,
  NSpace,
  useMessage,
  type DataTableColumns,
  type DataTableSortState,
} from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'

import { userApi } from '@/api/userApi'
import UserFormModal from '@/components/UserFormModal.vue'
import type { User, UserFilter, UserFormModel } from '@/types/user'

const message = useMessage()

// State
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const dataSource = ref<User[]>([])
const resultsLength = ref(0)

const showUserModal = ref(false)
const editingUser = ref<User | null>(null)

const form = reactive({
  userName: '',
  fullName: '',
})

const filter = reactive<UserFilter>({
  userName: '',
  fullName: '',
  sort: '',
  order: '',
  page: 1,
  perPage: 25,
})

const pagination = reactive({
  page: 1,
  pageSize: 25,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [5, 10, 25, 100],
})

// Load users from backend
async function loadData() {
  loading.value = true
  error.value = ''

  try {
    filter.userName = form.userName.trim()
    filter.fullName = form.fullName.trim()

    console.log('filete', filter)

    const response = await userApi.getUsers(filter)

    dataSource.value = response.items
    resultsLength.value = response.totalCount
    pagination.itemCount = response.totalCount
  } catch (e) {
    dataSource.value = []
    resultsLength.value = 0
    pagination.itemCount = 0

    error.value = 'An error occurred while loading users.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Search
function search() {
  filter.page = 1
  pagination.page = 1

  loadData()
}

// Pagination
function handlePageChange(page: number) {
  filter.page = page
  pagination.page = page

  loadData()
}

function handlePageSizeChange(pageSize: number) {
  filter.perPage = pageSize
  filter.page = 1

  pagination.pageSize = pageSize
  pagination.page = 1

  loadData()
}

// Sorting
function handleSortChange(sorter: DataTableSortState | null) {
  if (!sorter || !sorter.order) {
    filter.sort = ''
    filter.order = ''
  } else {
    filter.sort = String(sorter.columnKey)

    filter.order = sorter.order === 'ascend' ? 'asc' : 'desc'
  }

  filter.page = 1
  pagination.page = 1

  loadData()
}

// Add
function add() {
  error.value = ''
  editingUser.value = null
  showUserModal.value = true
}

// Edit
function edit(user: User) {
  error.value = ''
  editingUser.value = user
  showUserModal.value = true
}

async function saveUser(payload: UserFormModel) {
  error.value = ''
  saving.value = true

  try {
    const result = await userApi.addEditUser(payload)

    if (result > 0) {
      message.success(payload.isEdit ? 'User updated successfully.' : 'User added successfully.')
      showUserModal.value = false
      editingUser.value = null
      await loadData()
    } else {
      error.value = 'An error occurred while saving user.'
      message.error('An error occurred while saving user.')
    }
  } catch (e) {
    error.value = 'An error occurred while saving user.'
    message.error('An error occurred while saving user.')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// Delete
async function deleteUser(user: User) {
  error.value = ''

  try {
    const result = await userApi.deleteUser(user)

    if (result > 0) {
      message.success('User deleted successfully.')

      // Reload current page
      await loadData()
    } else {
      error.value = 'An error occurred while deleting user.'
    }
  } catch (e) {
    error.value = 'An error occurred while deleting user.'
    console.error(e)
  }
}

// Table columns
const columns: DataTableColumns<User> = [
  {
    title: 'User Name',
    key: 'userName',
    sorter: 'default',
  },
  {
    title: 'Personeli',
    key: 'personeli',
    sorter: 'default',
  },
  {
    title: 'Full Name',
    key: 'fullName',
    sorter: 'default',
  },
  {
    title: 'Mobile 1',
    key: 'mobile1',
  },
  {
    title: 'Mobile 2',
    key: 'mobile2',
  },
  {
    title: 'Tel',
    key: 'tel',
  },
  {
    title: 'Register Date',
    key: 'registerDate',
    sorter: 'default',
  },
  {
    title: 'Role',
    key: 'roleTitle',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'User Type',
    key: 'userTypeStr',
  },
  {
    title: 'Description',
    key: 'description',
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(
        NSpace,
        { size: 8, align: 'center', wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'info',
                onClick: () => edit(row),
              },
              {
                icon: () => h(CreateOutline, { size: 18 }),
              },
            ),

            h(
              NPopconfirm,
              {
                positiveText: 'Delete',
                negativeText: 'Cancel',
                onPositiveClick: () => deleteUser(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      quaternary: true,
                      type: 'error',
                    },
                    {
                      icon: () => h(TrashOutline, { size: 18 }),
                    },
                  ),
                default: () => 'Are you sure you want to delete this user?',
              },
            ),
          ],
        },
      )
    },
  },
]

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="users-page">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <n-card class="users-card">
      <template #header> Users Management </template>

      <n-form :model="form" label-placement="top" @submit.prevent="search">
        <div class="filter-row">
          <n-form-item label="User Name">
            <n-input
              v-model:value="form.userName"
              placeholder="User Name"
              clearable
              @keyup.enter="search"
            />
          </n-form-item>

          <n-form-item label="Full Name">
            <n-input
              v-model:value="form.fullName"
              placeholder="Full Name"
              clearable
              @keyup.enter="search"
            />
          </n-form-item>

          <div class="filter-button">
            <n-button type="info" :loading="loading" @click="search"> Search </n-button>
          </div>
        </div>
      </n-form>

      <n-data-table
        remote
        striped
        :columns="columns"
        :data="dataSource"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: User) => row.id"
        :scroll-x="1500"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @update:sorter="handleSortChange"
      />

      <template #footer>
        <div class="footer-actions">
          <n-button type="success" @click="add"> + Add New User </n-button>
        </div>
      </template>
    </n-card>

    <UserFormModal
      v-model:show="showUserModal"
      :user="editingUser"
      :saving="saving"
      @save="saveUser"
    />
  </div>
</template>

<style scoped>
.users-page {
  width: 100%;
}

.users-card {
  width: 100%;
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 20px;
}

.filter-row :deep(.n-form-item) {
  margin-bottom: 0;
}

.filter-button {
  padding-bottom: 4px;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
}

.error-message {
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #d03050;
  border-radius: 6px;
  color: #e88080;
  background: rgba(208, 48, 80, 0.08);
}

@media (max-width: 700px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
}
</style>
