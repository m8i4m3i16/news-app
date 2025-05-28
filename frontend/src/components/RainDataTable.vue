<template>
  <div class="rain-data-container">
    <!-- TEST -->
    <!-- <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee">
      <n-h3>CSRF 保護測試</n-h3>
      <n-button type="primary" @click="handlePostSomething"> 發送受保護的 POST 請求 </n-button>
      <p style="font-size: 0.9em; color: #777; margin-top: 10px">
        點擊此按鈕將嘗試向 <code>/api/submit-something</code> 發送 POST 請求。<br />
        請打開瀏覽器開發者工具的 Network 和 Console 標籤頁查看請求過程和結果。
      </p>
    </div> -->
    <!-- TEST END -->
    <div class="header-section">
      <n-h2 align-text type="info">臺北市即時雨量站資料</n-h2>
      <div class="font-size-control">
        <n-button-group>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button size="small" @click="decreaseFontSize" :disabled="fontSize <= 12">
                <template #icon> - </template>
              </n-button>
            </template>
            縮小字體
          </n-tooltip>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button size="small" @click="increaseFontSize" :disabled="fontSize >= 24">
                <template #icon> + </template>
              </n-button>
            </template>
            放大字體
          </n-tooltip>
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

<script lang="ts">
import { defineComponent } from 'vue'
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
  NTooltip,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { SearchOutline, RemoveOutline, AddOutline } from '@vicons/ionicons5'
import { useDebounceFn } from '@vueuse/core'
import apiClient from '../services/axiosInstance'

interface RainStation {
  stationNo: string
  stationName: string
  recTime: string
  rain: number
}

export default defineComponent({
  name: 'RainDataTable',
  components: {
    NSpin,
    NDataTable,
    NEmpty,
    NAlert,
    NH2,
    NInput,
    NIcon,
    NButton,
    NButtonGroup,
    NTooltip,
  },
  setup() {
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
        title: '雨量值(mm)',
        key: 'rain',
        sorter: 'default',
        align: 'center',
        width: 180,
        render(row) {
          let color = 'inherit' // default black for < 3mm
          if (row.rain >= 10) {
            color = 'purple'
          } else if (row.rain >= 7) {
            color = 'red'
          } else if (row.rain >= 5) {
            color = 'yellow'
          } else if (row.rain >= 4) {
            color = 'green'
          } else if (row.rain >= 3) {
            color = 'blue'
          }
          return h(
            'span',
            {
              style: {
                color: color,
                fontWeight: row.rain >= 2 ? 'bold' : 'normal',
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
        const response = await apiClient.get<RainStation[]>('/api/rain-data')
        // const response = await axios.get<RainStation[]>('http://localhost:3001/api/rain-data')
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

    const getCsrfToken = async (): Promise<string | null> => {
      try {
        const response = await apiClient.get('/api/csrf-token')
        // const response = await axios.get('http://localhost:3001/api/csrf-token', {
        //   withCredentials: true,
        // })
        return response.data.csrfToken
      } catch (error) {
        console.error('獲取 CSRF token 失敗:', error)
        alert('獲取 CSRF token 失敗，請檢查後端服務和網路。')
        return null
      }
    }

    const handlePostSomething = async () => {
      const csrfToken = await getCsrfToken()

      if (!csrfToken) return

      const dataToSubmit = {
        message: 'Hello from Vue frontend!',
        timestamp: new Date().toISOString(),
      }

      try {
        console.log('準備發送 POST 請求，CSRF Token:', csrfToken)
        const response = await apiClient.post('/api/submit-something', dataToSubmit, {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        })
        // const response = await axios.post('http://localhost:3001/api/submit-something', dataToSubmit, {
        //   headers: {
        //     'X-CSRF-Token': csrfToken,
        //   },
        //   withCredentials: true,
        // })
        console.log('POST 請求成功:', response.data)
        alert(`提交成功: ${response.data.message}`)
      } catch (error: any) {
        console.error('POST 請求失敗:', error.response?.data || error.message)
        alert(`提交失敗: ${error.response?.data?.message || '請檢查控制台獲取更多信息。'}`)
      }
    }

    return {
      allRainStations,
      loading,
      error,
      searchKeyword,
      fontSize,
      columns,
      pagination,
      filteredStations,
      increaseFontSize,
      decreaseFontSize,
      debouncedSearch,
      SearchOutline,
      RemoveOutline,
      AddOutline,
      handlePostSomething,
    }
  },
})
</script>

<style scoped>
.rain-data-container {
  margin: 20px auto;
  padding: 20px;
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
:deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-td),
:deep(.n-data-table:not(.n-data-table--single-line) .n-data-table-th) {
  border-right: none;
}
:deep(.n-data-table.n-data-table--bottom-bordered .n-data-table-td.n-data-table-td--last-row) {
  border-bottom: none;
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
