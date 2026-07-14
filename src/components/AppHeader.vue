<script setup>
import { ref } from 'vue'
const open=ref(false)
</script>
<template>
<header class="header"><div class="container nav-wrap">
  <router-link to="/" class="brand" @click="open=false"><span class="brand-mark">D</span><span><b>대전 LocalHub</b><small>DAEJEON TRAVEL & COMMUNITY</small></span></router-link>
  <button class="menu-button" @click="open=!open" :aria-expanded="open" aria-label="메뉴 열기">☰</button>
  <nav :class="['nav',{open}]">
    <router-link to="/" @click="open=false">홈</router-link><router-link to="/travel" @click="open=false">여행 정보</router-link><router-link to="/board" @click="open=false">커뮤니티</router-link>
  </nav>
</div></header>
</template>
