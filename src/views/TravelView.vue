<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LocationMap from '../components/LocationMap.vue'
import { service } from '../services/api'
import defaultImage from '@/assets/default-image.png'

const route = useRoute()
const router = useRouter()

const items = ref([])
const keyword = ref('')
const category = ref(String(route.query.category || ''))
const sort = ref('recommend')
const page = ref(1)
const loading = ref(false)
const error = ref('')

const size = 6
const fallbackImage = defaultImage

// 1. 각 아이템의 이미지 에러 상태를 저장할 객체 추가
const imageErrors = ref({})

// 2. 에러 발생 시 해당 아이템 ID를 기록하고 기본 이미지로 교체하는 함수
const handleImageError = (id, event) => {
  event.target.src = fallbackImage
  imageErrors.value[id] = true
}

const sorted = computed(() =>
  [...items.value].sort((a, b) => {
    if (sort.value === 'name') {
      return (a.name || '').localeCompare(b.name || '', 'ko')
    }

    return Number(b.id || 0) - Number(a.id || 0)
  }),
)

const visible = computed(() => sorted.value.slice(0, page.value * size))
const hasMore = computed(() => visible.value.length < items.value.length)

async function load() {
  loading.value = true
  error.value = ''
  page.value = 1
  imageErrors.value = {}

  try {
    items.value = await service.locations({
      keyword: keyword.value,
      category: category.value,
    })

    router.replace({
      query: category.value ? { category: category.value } : {},
    })
  } catch (loadError) {
    error.value = loadError.userMessage || loadError.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(category, load)
</script>

<template>
  <section class="page-heading">
    <span class="eyebrow">EXPLORE DAEJEON</span>
    <h1>대전 여행 정보</h1>
    <p>공공데이터를 기반으로 관광지, 맛집, 축제 정보를 제공합니다.</p>
  </section>

  <form class="search-panel" @submit.prevent="load">
    <label class="sr-only" for="travel-search">여행 정보 검색</label>
    <input
      id="travel-search"
      v-model="keyword"
      placeholder="장소명 또는 주소를 검색하세요"
    >
    <button>검색</button>
  </form>

  <div class="filter-row">
    <div class="tabs">
      <button
        v-for="itemCategory in ['', '관광지', '맛집', '축제']"
        :key="itemCategory"
        :class="{ active: category === itemCategory }"
        @click="category = itemCategory"
      >
        {{ itemCategory || '전체' }}
      </button>
    </div>

    <label>
      정렬
      <select v-model="sort">
        <option value="recommend">최신 등록순</option>
        <option value="name">이름순</option>
      </select>
    </label>
  </div>

  <div v-if="loading" class="empty-state">
    여행 정보를 불러오는 중입니다…
  </div>

  <div v-else-if="error" class="state-error">
    {{ error }}
    <button class="button" @click="load">다시 시도</button>
  </div>

  <template v-else>
    <LocationMap :locations="items" />

    <div class="result-head">
      <strong>{{ items.length }}개의 장소</strong>
    </div>

    <div v-if="visible.length" class="place-grid">
      <router-link
        v-for="item in visible"
        :key="item.id"
        :to="`/travel/${item.id}`"
        class="place-card"
      >
        <img
          :class="{ 'is-fallback': !item.image_url || imageErrors[item.id] }"
          :src="item.image_url || fallbackImage"
          @error="handleImageError(item.id, $event)"
          :alt="`${item.name} 대표 이미지`"
        >
        <div>
          <span class="badge">{{ item.category || '여행 정보' }}</span>
          <h3>{{ item.name }}</h3>
          <p>{{ item.description || item.address || '상세 정보가 없습니다.' }}</p>
          <small>{{ item.hours || item.period || item.address }}</small>
        </div>
      </router-link>
    </div>

    <p v-else class="empty-state">조건에 맞는 여행 정보가 없습니다.</p>

    <div v-if="hasMore" class="load-more">
      <button class="button ghost dark" @click="page++">더 보기</button>
    </div>
  </template>
</template>
