<script setup>
import { nextTick, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { service } from '../services/api'

const open = ref(false)
const input = ref('')
const loading = ref(false)
const body = ref(null)

const messages = ref([
  {
    role: 'assistant',
    content: '안녕하세요. 대전 관광지, 맛집, 축제와 여행 코스를 물어보세요.',
  },
])

const questions = [
  '대전 관광지 추천해 줘',
  '대전 맛집 알려 줘',
  '대전 축제 알려 줘',
  '대전 여행 코스 찾아 줘',
]

function renderMarkdown(content = '') {
  const html = marked.parse(content, {
    breaks: true,
    gfm: true,
  })

  return DOMPurify.sanitize(html)
}

async function send(value) {
  const message = (value ?? input.value).trim()

  if (!message || loading.value) {
    return
  }

  messages.value.push({
    role: 'user',
    content: message,
  })

  input.value = ''
  loading.value = true

  try {
    const data = await service.chat(message)

    messages.value.push({
      role: 'assistant',
      content:
        data.answer ||
        data.reply ||
        data.message ||
        data.content ||
        '답변을 확인하지 못했습니다.',
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content:
        error.userMessage ||
        '답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
    })
  } finally {
    loading.value = false

    await nextTick()

    body.value?.scrollTo({
      top: body.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

function keydown(event) {
  if (
    event.key === 'Enter' &&
    !event.shiftKey
  ) {
    event.preventDefault()
    send()
  }

  if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <button
    v-if="!open"
    class="chat-fab"
    aria-label="챗봇 열기"
    @click="open = true"
  >
    💬<span>여행 챗봇</span>
  </button>

  <section
    v-else
    class="chat-panel"
    aria-label="여행 챗봇"
    @keydown="keydown"
  >
    <header>
      <div>
        <strong>대전 여행 챗봇</strong>
        <small>공공데이터 기반 안내</small>
      </div>

      <button
        aria-label="챗봇 닫기"
        @click="open = false"
      >
        ×
      </button>
    </header>

    <div
      ref="body"
      class="chat-body"
    >
      <div class="quick-questions">
        <button
          v-for="question in questions"
          :key="question"
          :disabled="loading"
          @click="send(question)"
        >
          {{ question }}
        </button>
      </div>

      <template
        v-for="(message, index) in messages"
        :key="index"
      >
        <div
          v-if="message.role === 'assistant'"
          class="bubble bot markdown-body"
          v-html="renderMarkdown(message.content)"
        ></div>

        <div
          v-else
          class="bubble user"
        >
          {{ message.content }}
        </div>
      </template>

      <div
        v-if="loading"
        class="bubble bot"
      >
        답변을 찾는 중입니다…
      </div>
    </div>

    <form
      class="chat-input"
      @submit.prevent="send()"
    >
      <label
        class="sr-only"
        for="chat-message"
      >
        메시지
      </label>

      <textarea
        id="chat-message"
        v-model="input"
        rows="1"
        placeholder="대전 여행에 대해 물어보세요"
        @keydown="keydown"
      />

      <button
        :disabled="
          loading ||
          !input.trim()
        "
      >
        전송
      </button>
    </form>
  </section>
</template>