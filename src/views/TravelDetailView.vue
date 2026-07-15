<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LocationMap from '../components/LocationMap.vue'
import { service } from '../services/api'

const route = useRoute()
const item = ref(null)
const loading = ref(true)
const error = ref('')

const fallbackImage = 'https://placehold.co/1200x700?text=No+Image'

async function load() {
  loading.value = true
  error.value = ''

  try {
    item.value = await service.location(route.params.id)
  } catch (loadError) {
    error.value = loadError.userMessage || loadError.message
  } finally {
    loading.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('링크를 복사했습니다.')
  } catch {
    alert('링크를 복사하지 못했습니다.')
  }
}

onMounted(load)
</script>

<template>
  <div v-if="loading" class="empty-state">
    상세 정보를 불러오는 중입니다…
  </div>

  <div v-else-if="error" class="state-error">
    {{ error }}
    <button class="button" @click="load">다시 시도</button>
  </div>

  <article v-else-if="item" class="travel-detail">
    <div class="breadcrumb">
      <router-link to="/travel">여행 정보</router-link>
      <span>›</span>
      <span>{{ item.name }}</span>
    </div>

    <img
      class="detail-image"
      :src="item.image_url || fallbackImage"
      :alt="`${item.name} 대표 이미지`"
    >

    <div class="travel-detail-head">
      <div>
        <span class="badge">{{ item.category || '여행 정보' }}</span>
        <h1>{{ item.name }}</h1>
        <p>📍 {{ item.address || '주소 정보 없음' }}</p>
      </div>
      <button class="button ghost dark" @click="copy">링크 복사</button>
    </div>

    <div class="info-grid">
      <section>
        <h2>장소 소개</h2>
        <p>
          {{ item.description || item.address || '상세 설명이 준비 중입니다.' }}
        </p>
      </section>

      <dl>
        <template v-if="item.region">
          <dt>지역</dt>
          <dd>{{ item.region }}</dd>
        </template>

        <template v-if="item.address">
          <dt>주소</dt>
          <dd>{{ item.address }}</dd>
        </template>

        <template v-if="item.phone">
          <dt>전화번호</dt>
          <dd>{{ item.phone }}</dd>
        </template>

        <template v-if="item.hours">
          <dt>운영시간</dt>
          <dd>{{ item.hours }}</dd>
        </template>

        <template v-if="item.period || item.start_date">
          <dt>행사기간</dt>
          <dd>
            {{ item.period || `${item.start_date} ~ ${item.end_date || ''}` }}
          </dd>
        </template>

        <template v-if="item.homepage">
          <dt>홈페이지</dt>
          <dd>
            <a :href="item.homepage" target="_blank" rel="noopener">
              공식 홈페이지 ↗
            </a>
          </dd>
        </template>
      </dl>
    </div>

    <LocationMap
      v-if="item.latitude !== null && item.longitude !== null"
      :locations="[item]"
    />

    <router-link class="button back-button" to="/travel">
      목록으로 돌아가기
    </router-link>
  </article>
</template>
