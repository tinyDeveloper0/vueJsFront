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
import { CreateOutline, ListOutline, TrashOutline } from '@vicons/ionicons5'

import { roleApi } from '@/api/roleApi'
import RoleFormModal from '@/components/RoleFormModal.vue'
import RoleMenuAccessModal from '@/components/RoleMenuAccessModal.vue'
import type { MenuUpdateItem } from '@/types/menuAccess'
import type { Role, RoleFilter, RoleFormModel } from '@/types/role'

const message = useMessage()

const loading = ref(false)
const saving = ref(false)
const savingMenuAccess = ref(false)
const error = ref('')

const dataSource = ref<Role[]>([])
const resultsLength = ref(0)

const showRoleModal = ref(false)
const editingRole = ref<Role | null>(null)

const showMenuAccessModal = ref(false)
const menuAccessRole = ref<Role | null>(null)

const form = reactive({
  title: '',
})

const filter = reactive<RoleFilter>({
  title: '',
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

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    filter.title = form.title.trim()

    const response = await roleApi.getRoles(filter)

    dataSource.value = response.items
    resultsLength.value = response.totalCount
    pagination.itemCount = response.totalCount
  } catch (e) {
    dataSource.value = []
    resultsLength.value = 0
    pagination.itemCount = 0

    error.value = 'An error occurred while loading roles.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function search() {
  filter.page = 1
  pagination.page = 1

  loadData()
}

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

function add() {
  error.value = ''
  editingRole.value = null
  showRoleModal.value = true
}

function edit(role: Role) {
  error.value = ''
  editingRole.value = role
  showRoleModal.value = true
}

async function saveRole(payload: RoleFormModel) {
  error.value = ''
  saving.value = true

  try {
    const result = await roleApi.addEditRole(payload)

    if (result > 0) {
      message.success(payload.isEdit ? 'Role updated successfully.' : 'Role added successfully.')
      showRoleModal.value = false
      editingRole.value = null
      await loadData()
    } else {
      error.value = 'An error occurred while saving role.'
      message.error('An error occurred while saving role.')
    }
  } catch (e) {
    error.value = 'An error occurred while saving role.'
    message.error('An error occurred while saving role.')
    console.error(e)
  } finally {
    saving.value = false
  }
}

async function deleteRole(role: Role) {
  error.value = ''

  try {
    const result = await roleApi.deleteRole(role)

    if (result > 0) {
      message.success('Role deleted successfully.')
      await loadData()
    } else {
      error.value = 'An error occurred while deleting role.'
    }
  } catch (e) {
    error.value = 'An error occurred while deleting role.'
    console.error(e)
  }
}

function openMenuAccess(role: Role) {
  error.value = ''
  menuAccessRole.value = role
  showMenuAccessModal.value = true
}

async function saveMenuAccess(payload: {
  roleId: number
  selectedMenuIds: number[]
  menus: MenuUpdateItem[]
}) {
  error.value = ''
  savingMenuAccess.value = true

  try {
    const result = await roleApi.saveRoleMenuAccess(payload)

    if (result > 0) {
      message.success('Menu access saved successfully.')
      showMenuAccessModal.value = false
      menuAccessRole.value = null
    } else {
      error.value = 'An error occurred while saving menu access.'
      message.error('An error occurred while saving menu access.')
    }
  } catch (e) {
    error.value = 'An error occurred while saving menu access.'
    message.error('An error occurred while saving menu access.')
    console.error(e)
  } finally {
    savingMenuAccess.value = false
  }
}

const columns: DataTableColumns<Role> = [
  {
    title: 'Title',
    key: 'title',
    sorter: 'default',
  },
  {
    title: 'Access Type',
    key: 'accessTypeStr',
    sorter: 'default',
  },
  {
    title: 'Permissions',
    key: 'permissionTitles',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'Description',
    key: 'description',
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 140,
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
                title: 'Edit',
                onClick: () => edit(row),
              },
              {
                icon: () => h(CreateOutline, { size: 18 }),
              },
            ),

            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'warning',
                title: 'Menu Access',
                onClick: () => openMenuAccess(row),
              },
              {
                icon: () => h(ListOutline, { size: 18 }),
              },
            ),

            h(
              NPopconfirm,
              {
                positiveText: 'Delete',
                negativeText: 'Cancel',
                onPositiveClick: () => deleteRole(row),
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      quaternary: true,
                      type: 'error',
                      title: 'Delete',
                    },
                    {
                      icon: () => h(TrashOutline, { size: 18 }),
                    },
                  ),
                default: () => 'Are you sure you want to delete this role?',
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
  <div class="roles-page">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <n-card class="roles-card">
      <template #header> Roles Management </template>

      <n-form :model="form" label-placement="top" @submit.prevent="search">
        <div class="filter-row">
          <n-form-item label="Title">
            <n-input
              v-model:value="form.title"
              placeholder="Title"
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
        :row-key="(row: Role) => row.id"
        :scroll-x="900"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        @update:sorter="handleSortChange"
      />

      <template #footer>
        <div class="footer-actions">
          <n-button type="success" @click="add"> + Add New Role </n-button>
        </div>
      </template>
    </n-card>

    <RoleFormModal
      v-model:show="showRoleModal"
      :role="editingRole"
      :saving="saving"
      @save="saveRole"
    />

    <RoleMenuAccessModal
      v-model:show="showMenuAccessModal"
      :role="menuAccessRole"
      :saving="savingMenuAccess"
      @save="saveMenuAccess"
    />
  </div>
</template>

<style scoped>
.roles-page {
  width: 100%;
}

.roles-card {
  width: 100%;
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) auto;
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
