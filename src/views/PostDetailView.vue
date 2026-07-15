<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { service } from '../services/api'

const route = useRoute()
const router = useRouter()

const post = ref(null)
const modal = ref(false)
const mode = ref('delete')
const password = ref('')
const error = ref('')
const loading = ref(true)
const processing = ref(false)

async function load() {
  loading.value = true

  try {
    post.value = await service.post(route.params.id)
  } catch (loadError) {
    alert(loadError.userMessage || loadError.message)
    router.push('/board')
  } finally {
    loading.value = false
  }
}

function request(action) {
  mode.value = action
  password.value = ''
  error.value = ''
  modal.value = true
}

async function remove() {
  await service.deletePost(route.params.id, password.value)
  modal.value = false
  router.push('/board')
}

async function confirm() {
  if (!password.value || processing.value) {
    return
  }

  processing.value = true
  error.value = ''

  try {
    if (mode.value === 'edit') {
      await service.verifyPassword(route.params.id, password.value)

      modal.value = false
      router.push({
        path: `/board/${route.params.id}/edit`,
        query: {
          password: password.value,
        },
      })
    } else {
      await remove()
    }
  } catch (confirmError) {
    error.value =
      confirmError.userMessage ||
      confirmError.response?.data?.detail ||
      confirmError.message ||
      '요청을 처리하지 못했습니다.'
  } finally {
    processing.value = false
  }
}

function keydown(event) {
  if (event.key === 'Escape') {
    modal.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-if="loading && !post" class="empty-state">
    게시글을 불러오는 중입니다…
  </div>

  <article v-if="post" class="detail-page">
    <div class="breadcrumb">
      <router-link to="/board">커뮤니티</router-link>
      <span>›</span>
      <span>게시글 상세</span>
    </div>

    <header>
      <span class="category-chip">익명 게시글</span>
      <h1>{{ post.title }}</h1>
      <div class="detail-meta">
        <span>{{ post.author || '익명' }}</span>
        <span>{{ new Date(post.created_at).toLocaleString('ko-KR') }}</span>
        <span>조회 {{ post.view_count || 0 }}</span>
      </div>
    </header>

    <div class="detail-content">{{ post.content }}</div>

    <div class="detail-actions">
      <button class="button ghost dark" @click="request('edit')">수정</button>
      <button class="button danger" @click="request('delete')">삭제</button>
      <router-link class="button" to="/board">목록</router-link>
    </div>
  </article>

  <div
    v-if="modal"
    class="modal-backdrop"
    @click.self="modal = false"
    @keydown="keydown"
  >
    <form
      class="modal"
      role="dialog"
      aria-modal="true"
      @submit.prevent="confirm"
    >
      <button
        type="button"
        class="modal-close"
        aria-label="모달 닫기"
        @click="modal = false"
      >
        ×
      </button>

      <h2>게시글 {{ mode === 'edit' ? '수정' : '삭제' }}</h2>
      <p>작성 시 등록한 비밀번호를 입력해 주세요.</p>

      <label class="sr-only" for="post-password">비밀번호</label>
      <input
        id="post-password"
        v-model="password"
        type="password"
        required
        autofocus
        placeholder="비밀번호"
      >

      <small v-if="error" class="form-error">{{ error }}</small>

      <button
        class="button"
        :class="{ danger: mode === 'delete' }"
        :disabled="processing"
      >
        {{ processing ? '처리 중…' : '확인' }}
      </button>
    </form>
  </div>
</template>
