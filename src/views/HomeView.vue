<script setup>
import { onMounted, ref } from 'vue'
import { service } from '../services/api'
const locations=ref([]), posts=ref([]), loading=ref(true), error=ref('')
async function load(){loading.value=true;error.value='';try{[locations.value,posts.value]=await Promise.all([service.locations({}),service.posts('')])}catch(e){error.value=e.userMessage||e.message}finally{loading.value=false}}
onMounted(load)
</script>
<template>
<section class="hero"><div class="hero-copy"><span class="pill">대전 공공데이터 여행 플랫폼</span><h1>대전 여행 정보를<br><em>한 곳에서</em></h1><p>관광지와 맛집, 축제를 한눈에 찾고 익명 커뮤니티에서 생생한 여행 정보를 나눠보세요.</p><div class="hero-actions"><router-link class="button" to="/travel">여행 정보 보기</router-link><router-link class="button ghost" to="/board">커뮤니티 보기</router-link></div></div><div class="hero-art"><span class="pin p1">성심당</span><span class="pin p2">한밭수목원</span><span class="pin p3">대동하늘공원</span><strong>DAEJEON</strong></div></section>
<section class="quick-grid"><router-link to="/travel?category=관광지" class="quick-card"><span>01</span><b>관광지</b><p>도심 자연부터 과학 체험까지</p></router-link><router-link to="/travel?category=맛집" class="quick-card"><span>02</span><b>맛집</b><p>대전 대표 메뉴와 현지인 추천</p></router-link><router-link to="/travel?category=축제" class="quick-card"><span>03</span><b>축제·행사</b><p>기간별 즐길 거리와 행사 정보</p></router-link></section>
<div v-if="loading" class="empty-state">대전의 추천 정보를 불러오는 중입니다…</div><div v-else-if="error" class="state-error">{{error}} <button class="button" @click="load">다시 시도</button></div>
<template v-else><section class="section"><div class="section-title"><div><span class="eyebrow">LOCAL PICKS</span><h2>대전 추천 여행지</h2></div><router-link to="/travel">전체 보기 →</router-link></div><div v-if="locations.length" class="place-grid"><router-link v-for="item in locations.slice(0,3)" :key="item.id" :to="`/travel/${item.id}`" class="place-card"><img :src="item.image_url" :alt="item.name"/><div><span class="badge">{{item.category}}</span><h3>{{item.name}}</h3><p>{{item.description}}</p><small>{{item.address}}</small></div></router-link></div><p v-else class="empty-state">추천 여행 정보가 없습니다.</p></section>
<section class="section community-preview"><div class="section-title"><div><span class="eyebrow">LOCAL STORIES</span><h2>최근 여행 이야기</h2></div><router-link to="/board">게시판 가기 →</router-link></div><div v-if="posts.length" class="preview-list"><router-link v-for="post in posts.slice(0,5)" :key="post.id" :to="`/board/${post.id}`"><span>{{post.category||'여행'}}</span><strong>{{post.title}}</strong><small>조회 {{post.view_count||post.views||0}}</small></router-link></div><p v-else class="empty-state">아직 등록된 이야기가 없습니다.</p></section></template>
</template>
