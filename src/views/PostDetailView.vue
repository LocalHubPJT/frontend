<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { service } from '../services/api'
const route=useRoute(),router=useRouter(),post=ref(null),modal=ref(false),mode=ref('delete'),password=ref(''),error=ref(''),loading=ref(true)
onMounted(async()=>{try{post.value=await service.post(route.params.id)}catch(e){alert(e.userMessage||e.message);router.push('/board')}finally{loading.value=false}})
async function remove(){error.value='';try{await service.deletePost(route.params.id,password.value);router.push('/board')}catch(e){error.value=e.response?.data?.detail||e.message||'삭제에 실패했습니다.'}}
function request(action){mode.value=action;password.value='';error.value='';modal.value=true}
function confirm(){if(mode.value==='edit'){router.push({path:`/board/${route.params.id}/edit`,query:{password:password.value}});modal.value=false}else remove()}
function keydown(e){if(e.key==='Escape')modal.value=false}
</script>
<template><div v-if="loading&&!post" class="empty-state">게시글을 불러오는 중입니다…</div><article v-if="post" class="detail-page"><div class="breadcrumb"><router-link to="/board">커뮤니티</router-link><span>›</span><span>게시글 상세</span></div><header><span class="category-chip">익명 게시글</span><h1>{{post.title}}</h1><div class="detail-meta"><span>익명</span><span>{{new Date(post.created_at||post.createdAt).toLocaleString('ko-KR')}}</span><span>조회 {{post.view_count||post.views||0}}</span></div></header><div class="detail-content">{{post.content}}</div><div class="detail-actions"><button class="button ghost dark" @click="request('edit')">수정</button><button class="button danger" @click="request('delete')">삭제</button><router-link class="button" to="/board">목록</router-link></div></article>
<div v-if="modal" class="modal-backdrop" @click.self="modal=false" @keydown="keydown"><form class="modal" role="dialog" aria-modal="true" @submit.prevent="confirm"><button type="button" class="modal-close" aria-label="모달 닫기" @click="modal=false">×</button><h2>게시글 {{mode==='edit'?'수정':'삭제'}}</h2><p>작성 시 등록한 비밀번호를 입력해 주세요.</p><label class="sr-only" for="post-password">비밀번호</label><input id="post-password" v-model="password" type="password" required autofocus placeholder="비밀번호"/><small v-if="error" class="form-error">{{error}}</small><button class="button" :class="{danger:mode==='delete'}">확인</button></form></div></template>
