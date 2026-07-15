import axios from 'axios'
import { mockLocations } from '../data/mock'
import { localPosts } from './localStore'

export const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', timeout: 10000 })
const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'false') === 'true'
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 180))
const body = (response) => response?.data?.data ?? response?.data?.items ?? response?.data?.results ?? response?.data ?? response
const list = (response) => { const value = body(response); return Array.isArray(value) ? value : value?.content ?? [] }

client.interceptors.response.use((response) => response, (error) => {
  error.userMessage = error.response?.data?.detail || error.response?.data?.message || (error.code === 'ECONNABORTED' ? '요청 시간이 초과되었습니다.' : '서버와 통신하지 못했습니다.')
  return Promise.reject(error)
})

export const service = {
  async locations(params = {}) { if (!useMock) return list(await client.get('/api/locations', { params })); const q=(params.keyword||'').toLowerCase(); return wait(mockLocations.filter(x=>(!params.category||x.category===params.category)&&(!q||`${x.name} ${x.address} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(q)))) },
  async location(id) { if (!useMock) return body(await client.get(`/api/locations/${id}`)); const item=mockLocations.find(x=>x.id===Number(id)); if(!item) throw new Error('여행 정보를 찾을 수 없습니다.'); return wait(item) },
  async posts(keyword='') { if (!useMock) return list(await client.get('/api/posts',{params:{keyword}})); return wait(localPosts.list(keyword)) },
  async post(id,{countView=true}={}) { if (!useMock) return body(await client.get(`/api/posts/${id}`)); return wait(countView?localPosts.get(id):localPosts.peek(id)) },
  async createPost(payload) { return useMock ? wait(localPosts.create(payload)) : body(await client.post('/api/posts',payload)) },
  async updatePost(id,payload) { return useMock ? wait(localPosts.update(id,payload)) : body(await client.put(`/api/posts/${id}`,payload)) },
  async verifyPassword(id, password) {
  return useMock
    ? wait(localPosts.verify(id, password))
    : body(
        await client.post(`/api/posts/${id}/verify`, {
          password
        })
      )
},
  async deletePost(id,password) { return useMock ? wait(localPosts.remove(id,password)) : body(await client.delete(`/api/posts/${id}`,{data:{password}})) },
  async chat(message,history=[]) { if (!useMock) return body(await client.post('/api/chat',{message,history})); const text=message.toLowerCase(); let answer='대전 여행에 대해 관광지, 맛집, 축제를 물어보세요.'; if(text.includes('맛집')) answer='성심당 본점과 태평소국밥을 추천합니다.'; else if(text.includes('관광')||text.includes('가볼')) answer='한밭수목원, 국립중앙과학관, 대동하늘공원을 추천합니다.'; else if(text.includes('축제')) answer='대전 0시 축제를 확인해 보세요. 정확한 일정은 여행 정보에서 확인할 수 있습니다.'; else if(text.includes('커뮤니티')||text.includes('코스')) answer='커뮤니티에서 “여행코스”를 검색하면 이용자들의 동선을 확인할 수 있습니다.'; return wait({answer}) },
}
