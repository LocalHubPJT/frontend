<script setup>
import { computed, onMounted, ref } from 'vue'
import { service } from '../services/api'
const posts=ref([]),keyword=ref(''),page=ref(1),loading=ref(false); const size=7
const totalPages=computed(()=>Math.max(1,Math.ceil(posts.value.length/size))); const paged=computed(()=>posts.value.slice((page.value-1)*size,page.value*size))
const error=ref(''); async function load(){loading.value=true;error.value='';try{posts.value=await service.posts(keyword.value);page.value=1}catch(e){error.value=e.userMessage||e.message}finally{loading.value=false}}
onMounted(load)
const date=v=>new Date(v).toLocaleDateString('ko-KR',{year:'2-digit',month:'2-digit',day:'2-digit'})
</script>
<template><section class="page-heading board-heading"><div><span class="eyebrow">COMMUNITY</span><h1>대전 여행 커뮤니티</h1><p>로그인 없이 익명으로 여행 경험과 지역 정보를 자유롭게 공유해 보세요.</p></div><router-link class="button" to="/board/write">글쓰기</router-link></section>
<form class="search-panel" @submit.prevent="load"><label class="sr-only" for="post-search">게시글 검색</label><input id="post-search" v-model="keyword" placeholder="게시글 제목 또는 내용을 검색하세요"/><button>검색</button></form>
<div v-if="error" class="state-error">{{error}} <button class="button" @click="load">다시 시도</button></div><div v-else class="board-card"><div class="board-header"><span>번호</span><span>작성자</span><span>제목</span><span>조회</span><span>작성일</span></div><router-link v-for="post in paged" :key="post.id" :to="`/board/${post.id}`" class="board-row"><span>{{post.id}}</span><span>익명</span><strong>{{post.title}}</strong><span>{{post.view_count||post.views||0}}</span><time>{{date(post.created_at||post.createdAt)}}</time></router-link><p v-if="loading" class="empty-state">게시글을 불러오는 중입니다…</p><p v-else-if="!posts.length" class="empty-state">등록된 게시글이 없습니다.</p></div>
<div class="pagination" v-if="totalPages>1"><button @click="page=Math.max(1,page-1)">‹</button><button v-for="n in totalPages" :key="n" :class="{active:page===n}" @click="page=n">{{n}}</button><button @click="page=Math.min(totalPages,page+1)">›</button></div></template>
