<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  NButton,
  NIcon,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  NTree,
  type SelectOption,
  type TreeDropInfo,
  type TreeOption,
} from 'naive-ui'
import * as IonIcons from '@vicons/ionicons5'

import { roleApi } from '@/api/roleApi'
import { menuIconNames } from '@/enums/menuIcons'
import type { MenuAccessItem, MenuUpdateItem } from '@/types/menuAccess'
import type { Role } from '@/types/role'

interface MenuTreeOption extends TreeOption {
  key: number
  label: string
  icon: string | null
  route: string | null
  parentId: number | null
  children?: MenuTreeOption[]
}

const props = defineProps<{
  show: boolean
  role: Role | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  save: [payload: { roleId: number; selectedMenuIds: number[]; menus: MenuUpdateItem[] }]
}>()

const loading = ref(false)
const treeData = ref<MenuTreeOption[]>([])
const checkedKeys = ref<number[]>([])
const expandedKeys = ref<number[]>([])

const title = computed(() =>
  props.role ? `Menu Access — ${props.role.title}` : 'Menu Access',
)

const iconOptions = computed<SelectOption[]>(() =>
  menuIconNames.map((name) => ({
    label: name,
    value: name,
  })),
)

function resolveIcon(iconName: string | null) {
  if (!iconName) return null
  return (IonIcons as unknown as Record<string, Parameters<typeof h>[0]>)[iconName] ?? null
}

function mapMenusToTree(items: MenuAccessItem[]): MenuTreeOption[] {
  return items.map((item) => {
    const children = item.children?.length ? mapMenusToTree(item.children) : undefined

    return {
      key: item.id,
      label: item.title,
      icon: item.icon,
      route: item.route,
      parentId: item.parentId,
      children,
    }
  })
}

function collectExpandedKeys(items: MenuTreeOption[]): number[] {
  const keys: number[] = []

  for (const item of items) {
    if (item.children?.length) {
      keys.push(item.key)
      keys.push(...collectExpandedKeys(item.children))
    }
  }

  return keys
}

async function loadData() {
  if (!props.role) return

  loading.value = true

  try {
    const response = await roleApi.getRoleMenuAccess(props.role.id)
    treeData.value = mapMenusToTree(response.menus ?? [])
    checkedKeys.value = [...(response.selectedMenuIds ?? [])]
    expandedKeys.value = collectExpandedKeys(treeData.value)
  } catch (e) {
    console.error(e)
    treeData.value = []
    checkedKeys.value = []
    expandedKeys.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.show,
  (visible) => {
    if (!visible) return
    void loadData()
  },
)

function findSiblings(
  options: MenuTreeOption[],
  key: number,
): { siblings: MenuTreeOption[]; index: number } | null {
  for (let i = 0; i < options.length; i++) {
    if (options[i].key === key) {
      return { siblings: options, index: i }
    }

    const children = options[i].children
    if (children?.length) {
      const found = findSiblings(children, key)
      if (found) return found
    }
  }

  return null
}

function containsKey(node: MenuTreeOption, key: number): boolean {
  if (node.key === key) return true
  return node.children?.some((child) => containsKey(child, key)) ?? false
}

function handleDrop({ node, dragNode, dropPosition }: TreeDropInfo) {
  const data = treeData.value
  const dragKey = Number(dragNode.key)
  const dropKey = Number(node.key)

  if (dragKey === dropKey) return

  const dragInfo = findSiblings(data, dragKey)
  if (!dragInfo) return

  const dragItem = dragInfo.siblings[dragInfo.index]

  // Prevent dropping a parent into one of its descendants
  if (dropPosition === 'inside' && containsKey(dragItem, dropKey)) {
    return
  }

  dragInfo.siblings.splice(dragInfo.index, 1)

  if (dropPosition === 'inside') {
    const target = findSiblings(data, dropKey)
    if (!target) {
      dragInfo.siblings.splice(dragInfo.index, 0, dragItem)
      return
    }

    const parent = target.siblings[target.index]
    if (!parent.children) parent.children = []
    parent.children.unshift(dragItem)
    dragItem.parentId = parent.key
  } else {
    const dropInfo = findSiblings(data, dropKey)
    if (!dropInfo) {
      dragInfo.siblings.splice(dragInfo.index, 0, dragItem)
      return
    }

    const insertIndex =
      dropPosition === 'before' ? dropInfo.index : dropInfo.index + 1

    dropInfo.siblings.splice(insertIndex, 0, dragItem)

    const parentKey =
      dropInfo.siblings === data ? null : (findParentKey(data, dropKey) ?? null)

    dragItem.parentId = parentKey
  }

  treeData.value = [...data]
}

function findParentKey(options: MenuTreeOption[], childKey: number): number | null {
  for (const option of options) {
    if (option.children?.some((c) => c.key === childKey)) {
      return option.key
    }

    if (option.children?.length) {
      const found = findParentKey(option.children, childKey)
      if (found !== null) return found
    }
  }

  return null
}

function updateNodeIcon(key: number, icon: string | null) {
  const walk = (items: MenuTreeOption[]) => {
    for (const item of items) {
      if (item.key === key) {
        item.icon = icon
        return true
      }
      if (item.children?.length && walk(item.children)) return true
    }
    return false
  }

  walk(treeData.value)
  treeData.value = [...treeData.value]
}

function flattenMenus(
  items: MenuTreeOption[],
  parentId: number | null = null,
): MenuUpdateItem[] {
  const result: MenuUpdateItem[] = []

  items.forEach((item, index) => {
    result.push({
      id: item.key,
      parentId,
      icon: item.icon,
      position: index + 1,
    })

    if (item.children?.length) {
      result.push(...flattenMenus(item.children, item.key))
    }
  })

  return result
}

function renderLabel({ option }: { option: TreeOption }) {
  const node = option as MenuTreeOption
  const iconComp = resolveIcon(node.icon)

  return h(
    'div',
    {
      class: 'menu-node',
      onClick: (e: MouseEvent) => e.stopPropagation(),
      onMousedown: (e: MouseEvent) => {
        // keep tree drag working on label area, but not on select
        const target = e.target as HTMLElement
        if (target.closest('.n-base-selection') || target.closest('.n-base-select-menu')) {
          e.stopPropagation()
        }
      },
    },
    [
      h(
        'div',
        { class: 'menu-node-main' },
        [
          iconComp
            ? h(NIcon, { size: 16 }, { default: () => h(iconComp) })
            : h('span', { class: 'menu-icon-placeholder' }),
          h('span', { class: 'menu-title' }, node.label as string),
          node.route
            ? h('span', { class: 'menu-route' }, String(node.route))
            : null,
        ],
      ),
      h(NSelect, {
        value: node.icon,
        options: iconOptions.value,
        size: 'tiny',
        clearable: true,
        filterable: true,
        consistentMenuWidth: false,
        placeholder: 'Icon',
        class: 'menu-icon-select',
        to: 'body',
        renderLabel: (option: SelectOption) => {
          const name = String(option.value ?? '')
          const icon = resolveIcon(name)
          return h(
            'div',
            { class: 'icon-option' },
            [
              icon ? h(NIcon, { size: 16 }, { default: () => h(icon) }) : null,
              h('span', null, name),
            ],
          )
        },
        renderTag: ({ option }: { option: SelectOption }) => {
          const name = String(option.value ?? '')
          const icon = resolveIcon(name)
          return h(
            'div',
            { class: 'icon-tag' },
            [
              icon ? h(NIcon, { size: 14 }, { default: () => h(icon) }) : null,
              h('span', null, name),
            ],
          )
        },
        onClick: (e: MouseEvent) => e.stopPropagation(),
        onMousedown: (e: MouseEvent) => e.stopPropagation(),
        onUpdateValue: (value: string | null) => {
          updateNodeIcon(node.key, value)
        },
      }),
    ],
  )
}

function onCheckedKeysUpdate(keys: Array<string | number>) {
  checkedKeys.value = keys.map((key) => Number(key))
}

function onExpandedKeysUpdate(keys: Array<string | number>) {
  expandedKeys.value = keys.map((key) => Number(key))
}

function close() {
  emit('update:show', false)
}

function handleSave() {
  if (!props.role) return

  emit('save', {
    roleId: props.role.id,
    selectedMenuIds: [...checkedKeys.value],
    menus: flattenMenus(treeData.value),
  })
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    class="role-menu-access-modal"
    style="width: min(760px, 96vw)"
    :mask-closable="!saving"
    :closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <n-spin :show="loading">
      <div class="hint">
        Check menus to grant access. Drag items to change order. Pick an icon for each menu.
      </div>

      <div class="tree-panel">
        <n-tree
          v-if="treeData.length"
          block-line
          checkable
          cascade
          draggable
          expand-on-click
          :data="treeData"
          :checked-keys="checkedKeys"
          :expanded-keys="expandedKeys"
          :render-label="renderLabel"
          :selectable="false"
          @update:checked-keys="onCheckedKeysUpdate"
          @update:expanded-keys="onExpandedKeysUpdate"
          @drop="handleDrop"
        />

        <div v-else-if="!loading" class="empty-hint">No menus found.</div>
      </div>
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button size="small" :disabled="saving" @click="close">Cancel</n-button>
        <n-button size="small" type="primary" :loading="saving" :disabled="loading" @click="handleSave">
          Save
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.hint {
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}

.tree-panel {
  max-height: min(520px, calc(100vh - 220px));
  overflow: auto;
  padding: 8px 4px;
  border: 1px solid rgba(128, 128, 128, 0.28);
  border-radius: 6px;
}

.empty-hint {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

:deep(.menu-node) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding-right: 4px;
  box-sizing: border-box;
}

:deep(.menu-node-main) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

:deep(.menu-title) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.menu-route) {
  color: #999;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.menu-icon-placeholder) {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

:deep(.menu-icon-select) {
  width: 170px;
  flex-shrink: 0;
}

:deep(.icon-option),
:deep(.icon-tag) {
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.n-tree-node-content) {
  padding-right: 4px;
}
</style>

<style>
.role-menu-access-modal.n-card {
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}

.role-menu-access-modal .n-card__content {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.role-menu-access-modal .n-card__footer {
  padding-top: 8px;
}
</style>
