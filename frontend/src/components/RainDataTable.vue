<template>
  <div class="rain-data-container">
    <div class="header-section">
      <n-h2 align-text type="info">臺北市即時雨量站資料</n-h2>
      <div class="font-size-control">
        <n-button-group>
          <n-button size="small" @click="decreaseFontSize" :disabled="fontSize <= 12">
            <template #icon>
              <n-icon><remove-outline /></n-icon>
            </template>
          </n-button>
          <n-button size="small" @click="increaseFontSize" :disabled="fontSize >= 24">
            <template #icon>
              <n-icon><add-outline /></n-icon>
            </template>
          </n-button>
        </n-button-group>
      </div>
    </div>
    <!-- Search -->
    <n-input
      v-model="searchKeyword"
      placeholder="請輸入測站名稱或測站編號"
      clearable
      style="margin-bottom: 20px"
      @input="debouncedSearch"
    >
      <template #prefix>
        <n-icon :component="SearchOutline" />
      </template>
    </n-input>
    <!-- Data Table -->
    <n-spin :show="loading">
      <template #description> 資料載入中... </template>
      <n-data-table
        v-if="!error && filteredStations.length > 0"
        :columns="columns"
        :data="filteredStations"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        size="small"
        class="custom-table-lines"
      />
      <n-empty
        v-if="!loading && !error && filteredStations.length === 0 && !searchKeyword"
        description="目前沒有雨量資料。"
        style="margin-top: 20px"
      />
      <n-empty
        v-if="!loading && !error && filteredStations.length === 0 && searchKeyword"
        :description="`找不到包含 '${searchKeyword}' 的測站`"
        style="margin-top: 20px"
      />
    </n-spin>
    <n-alert title="錯誤" type="error" v-if="error" closable style="margin-top: 20px">
      {{ error }}
    </n-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import axios from 'axios'
import {
  NSpin,
  NDataTable,
  NEmpty,
  NAlert,
  NH2,
  NInput,
  NIcon,
  NButton,
  NButtonGroup,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutline, RemoveOutline, AddOutline } from '@vicons/ionicons5'
import { useDebounceFn } from '@vueuse/core'

interface RainStation {
  stationNo: string
  stationName: string
  recTime: string
  rain: number
}

const allRainStations = ref<RainStation[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchKeyword = ref('')
const fontSize = ref(16)

const formatRecTime = (recTimeString: string): string => {
  if (!recTimeString || recTimeString.length !== 12) return 'N/A'
  const year = recTimeString.substring(0, 4)
  const month = recTimeString.substring(4, 6)
  const day = recTimeString.substring(6, 8)
  const hour = recTimeString.substring(8, 10)
  const minute = recTimeString.substring(10, 12)
  return `${year}/${month}/${day} ${hour}:${minute}`
}

const createColumns = (): DataTableColumns<RainStation> => [
  {
    title: '測站編號',
    key: 'stationNo',
    align: 'left',
    titleAlign: 'left',
    width: 120,
  },
  {
    title: '測站名稱',
    key: 'stationName',
    align: 'center',
    width: 150,
  },
  {
    title: '目前雨量 (mm)',
    key: 'rain',
    sorter: 'default',
    align: 'center',
    width: 180,
    render(row) {
      return h(
        'span',
        {
          style: {
            color: row.rain > 4 ? 'red' : row.rain > 3 ? 'orange' : 'inherit',
            fontWeight: row.rain > 4 ? 'bold' : 'normal',
          },
        },
        row.rain.toFixed(1),
      )
    },
  },
  {
    title: '記錄時間',
    key: 'recTime',
    sorter: (rowA, rowB) =>
      new Date(formatRecTime(rowA.recTime)).getTime() -
      new Date(formatRecTime(rowB.recTime)).getTime(),
    render(row) {
      return formatRecTime(row.recTime)
    },
    align: 'center',
    width: 180,
  },
]

const columns = createColumns()

const pagination = ref({
  pageSize: 10,
})

// search
const debouncedSearch = useDebounceFn((value: string) => {
  searchKeyword.value = value
}, 300)

const filteredStations = computed(() => {
  if (!searchKeyword.value) return allRainStations.value
  const keyword = searchKeyword.value.toLowerCase().trim()
  return allRainStations.value.filter(
    (station) =>
      station.stationName.toLowerCase().includes(keyword) ||
      station.stationNo.toLowerCase().includes(keyword),
  )
})

// font size control
const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    localStorage.setItem('fontSize', fontSize.value.toString())
    document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`)
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    localStorage.setItem('fontSize', fontSize.value.toString())
    document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`)
  }
}

onMounted(async () => {
  const savedFontSize = localStorage.getItem('fontSize')
  if (savedFontSize) {
    fontSize.value = parseInt(savedFontSize)
    document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`)
  } else {
    document.documentElement.style.setProperty('--base-font-size', '16px')
  }

  try {
    loading.value = true
    error.value = null
    const response = await axios.get<RainStation[]>('http://localhost:3001/api/rain-data')
    allRainStations.value = response.data
  } catch (e: any) {
    console.error('獲取雨量資料失敗:', e)
    if (axios.isAxiosError(e)) {
      error.value = e.response?.data?.message || e.message || '獲取資料失敗 (Axios Error)。'
    } else {
      error.value = e.message || '獲取資料失敗，請稍後再試。'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.rain-data-container {
  margin: 20px auto;
  padding: 20px;
  max-width: 1240px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  font-size: var(--base-font-size);
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.font-size-control {
  display: flex;
  align-items: center;
}
@media (max-width: 768px) {
  .rain-data-container {
    margin: 10px;
    padding: 10px;
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}
:deep(.n-h2) {
  font-size: calc(var(--base-font-size) * 1.5);
  margin-top: 15px;
}
:deep(.n-data-table) {
  font-size: var(--base-font-size);
}
:deep(.n-input) {
  font-size: var(--base-font-size);
}
:deep(.n-button) {
  font-size: var(--base-font-size);
}
:deep(.n-empty) {
  font-size: var(--base-font-size);
}
:deep(.n-alert) {
  font-size: var(--base-font-size);
}
:deep(.n-data-table-th__title) {
  font-weight: 600;
}
:deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-td) {
  border-right: none;
}
:deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-th) {
  border-right: none;
}
:deep(.n-data-table .n-data-table-th .n-data-table-sorter .n-base-icon) {
  left: -5px;
}
:deep(.custom-table-lines .n-data-table__pagination) {
  display: flex;
  justify-content: center;
  padding-top: 15px;
}
</style>
