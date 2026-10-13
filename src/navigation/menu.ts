// import type { MenuOption } from 'naive-ui'
// import { HomeOutline, BarChartOutline, PeopleOutline, SettingsOutline } from '@vicons/ionicons5'

// import { NIcon } from 'naive-ui'
// import { h } from 'vue'

// function renderIcon(icon: typeof HomeOutline) {
//   return () =>
//     h(NIcon, null, {
//       default: () => h(icon),
//     })
// }

// export const menuItems: MenuOption[] = [
//   {
//     label: 'Dashboard',
//     key: '/dashboard',
//     icon: renderIcon(HomeOutline),
//   },
//   {
//     label: 'Reports',
//     key: '/reports',
//     icon: renderIcon(BarChartOutline),
//   },
//   {
//     label: 'Users',
//     key: '/users',
//     icon: renderIcon(PeopleOutline),
//   },
//   {
//     label: 'Settings',
//     key: '/settings',
//     icon: renderIcon(SettingsOutline),
//   },
// ]
import { h } from 'vue'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

import * as IonIcons from '@vicons/ionicons5'
import type { MenuItem } from '@/types/auth'

function renderIcon(iconName: string | null) {
  if (!iconName) {
    return undefined
  }

  const icons = IonIcons as Record<string, unknown>
  const iconComponent = icons[iconName]

  if (!iconComponent) {
    return undefined
  }

  return () =>
    h(NIcon, null, {
      default: () => h(iconComponent as never),
    })
}

export function mapMenuItems(items: MenuItem[]): MenuOption[] {
  return items
    .slice()
    .sort((a, b) => (a.position ?? 255) - (b.position ?? 255))
    .map((item) => ({
      label: item.title,
      key: item.route || `menu-${item.id}`,
      icon: renderIcon(item.icon),
      children: item.subMenus?.length ? mapMenuItems(item.subMenus) : undefined,
    }))
}
