<script setup>
import AppHeader from './components/AppHeader.vue'
import ChatWidget from './components/ChatWidget.vue'
</script>

<template>
  <AppHeader />
  <main class="container page"><RouterView /></main>
  <footer class="footer"><div class="container"><strong>대전ZIP</strong><span>대전의 오늘을 발견하고, 여행 이야기를 나누세요.</span></div></footer>
  <ChatWidget />
</template>
