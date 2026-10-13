<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NAlert, NCard, NDataTable, NSpin } from 'naive-ui'

import type { DataTableColumns } from 'naive-ui'

interface Coffee {
  id: number | string
  title: string
  description: string
  ingredients: string[] | string
  image: string
}

interface CoffeeRow {
  id: number | string
  title: string
  description: string
  ingredients: string
}

const coffees = ref<CoffeeRow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const columns: DataTableColumns<CoffeeRow> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Name',
    key: 'title',
    width: 180,
  },
  {
    title: 'Description',
    key: 'description',
  },
  {
    title: 'Ingredients',
    key: 'ingredients',
    width: 250,
  },
]

async function fetchCoffees() {
  loading.value = true
  error.value = null

  try {
    const response = await fetch('https://api.sampleapis.com/coffee/hot')

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const data: Coffee[] = await response.json()

    coffees.value = data.map((coffee) => ({
      id: coffee.id,
      title: coffee.title,
      description: coffee.description,
      ingredients: Array.isArray(coffee.ingredients)
        ? coffee.ingredients.join(', ')
        : coffee.ingredients,
    }))
  } catch (err) {
    console.error(err)

    error.value = 'Unable to load coffee data.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCoffees()
})
</script>

<template>
  <div class="report-page">
    <n-card title="Coffee Report">
      <n-spin :show="loading">
        <n-alert v-if="error" type="error" :title="error" class="error" />

        <n-data-table
          v-else
          :columns="columns"
          :data="coffees"
          :bordered="false"
          :single-line="false"
        />
      </n-spin>
    </n-card>
  </div>
</template>

<style scoped>
.report-page {
  width: 100%;
}
</style>
