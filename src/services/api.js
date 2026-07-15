import axios from 'axios'
import { mockLocations } from '../data/mock'
import { localPosts } from './localStore'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 100000,
})

const useMock = String(import.meta.env.VITE_USE_MOCK ?? 'false') === 'true'
const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 180))

const body = (response) =>
  response?.data?.data ??
  response?.data?.items ??
  response?.data?.results ??
  response?.data ??
  response

const list = (response) => {
  const value = body(response)
  return Array.isArray(value) ? value : value?.content ?? []
}

const categoryMap = {
  관광지: '12',
  문화시설: '14',
  축제: '15',
  축제공연행사: '15',
  여행코스: '25',
  레포츠: '28',
  숙박: '32',
  쇼핑: '38',
  맛집: '39',
  음식점: '39',
}

const normalizeLocation = (item = {}) => {
  const longitudeValue = item.longitude ?? item.mapx
  const latitudeValue = item.latitude ?? item.mapy
  const longitude = Number(longitudeValue)
  const latitude = Number(latitudeValue)

  return {
    ...item,
    name: item.name ?? item.title ?? '',
    category: item.category ?? item.content_type_name ?? '',
    address:
      item.address ??
      [item.addr1, item.addr2].filter(Boolean).join(' '),
    phone: item.phone ?? item.tel ?? '',
    longitude: Number.isFinite(longitude) ? longitude : null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    image_url:
      item.image_url ??
      item.image ??
      item.firstimage ??
      item.firstimage2 ??
      '',
    description:
      item.description ??
      [item.region, item.content_type_name].filter(Boolean).join(' '),
    hours: item.hours ?? '',
    period: item.period ?? '',
    homepage: item.homepage ?? '',
  }
}

const normalizePost = (post = {}) => ({
  ...post,
  author: post.author || '익명',
  view_count: post.view_count ?? post.views ?? 0,
  created_at: post.created_at ?? post.createdAt,
  updated_at: post.updated_at ?? post.updatedAt,
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? '요청 시간이 초과되었습니다.'
        : '서버와 통신하지 못했습니다.')

    return Promise.reject(error)
  },
)

export const service = {
  async locations(params = {}) {
    if (!useMock) {
      const response = await client.get('/api/locations', {
        params: {
          query: params.keyword?.trim() || undefined,
          category_id: categoryMap[params.category] || undefined,
        },
      })

      return list(response).map(normalizeLocation)
    }

    const q = (params.keyword || '').trim().toLowerCase()

    return wait(
      mockLocations
        .filter((item) => {
          const matchesCategory =
            !params.category || item.category === params.category
          const searchable = `${item.name} ${item.address} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase()
          const matchesKeyword = !q || searchable.includes(q)
          return matchesCategory && matchesKeyword
        })
        .map(normalizeLocation),
    )
  },

  async location(id) {
    if (!useMock) {
      try {
        const response = await client.get(`/api/locations/${id}`)
        return normalizeLocation(body(response))
      } catch (error) {
        if (error.response?.status !== 404) {
          throw error
        }

        const locations = await this.locations()
        const item = locations.find((location) => location.id === Number(id))

        if (!item) {
          const notFound = new Error('여행 정보를 찾을 수 없습니다.')
          notFound.userMessage = notFound.message
          throw notFound
        }

        return item
      }
    }

    const item = mockLocations.find((location) => location.id === Number(id))

    if (!item) {
      throw new Error('여행 정보를 찾을 수 없습니다.')
    }

    return wait(normalizeLocation(item))
  },

  async posts(keyword = '') {
    if (!useMock) {
      const response = await client.get('/api/posts')
      const posts = list(response).map(normalizePost)
      const q = keyword.trim().toLowerCase()

      if (!q) {
        return posts
      }

      return posts.filter((post) =>
        `${post.title} ${post.content} ${post.author}`
          .toLowerCase()
          .includes(q),
      )
    }

    return wait(localPosts.list(keyword).map(normalizePost))
  },

  async post(id, { countView = true } = {}) {
    if (!useMock) {
      const response = await client.get(`/api/posts/${id}`)
      return normalizePost(body(response))
    }

    const post = countView ? localPosts.get(id) : localPosts.peek(id)
    return wait(normalizePost(post))
  },

  async createPost(payload) {
    if (useMock) {
      return wait(normalizePost(localPosts.create(payload)))
    }

    const response = await client.post('/api/posts', {
      title: payload.title,
      content: payload.content,
      password: payload.password,
      author: payload.author || '익명',
    })

    return normalizePost(body(response))
  },

  async updatePost(id, payload) {
    if (useMock) {
      return wait(normalizePost(localPosts.update(id, payload)))
    }

    const response = await client.put(`/api/posts/${id}`, {
      title: payload.title,
      content: payload.content,
      password: payload.password,
    })

    return normalizePost(body(response))
  },

  async verifyPassword(id, password) {
    if (useMock) {
      return wait(localPosts.verify(id, password))
    }

    return body(
      await client.post(`/api/posts/${id}/verify`, {
        password,
      }),
    )
  },

  async deletePost(id, password) {
    if (useMock) {
      return wait(localPosts.remove(id, password))
    }

    return body(
      await client.delete(`/api/posts/${id}`, {
        data: { password },
      }),
    )
  },

  async chat(message) {
    if (!useMock) {
      const data = body(
        await client.post('/api/chat', {
          message,
        }),
      )

      return {
        ...data,
        answer: data.answer ?? data.reply ?? data.message ?? data.content ?? '',
      }
    }

    const text = message.toLowerCase()
    let answer = '대전 여행에 대해 관광지, 맛집, 축제를 물어보세요.'

    if (text.includes('맛집')) {
      answer = '성심당 본점과 태평소국밥을 추천합니다.'
    } else if (text.includes('관광') || text.includes('가볼')) {
      answer = '한밭수목원, 국립중앙과학관, 대동하늘공원을 추천합니다.'
    } else if (text.includes('축제')) {
      answer = '대전 0시 축제를 확인해 보세요. 정확한 일정은 여행 정보에서 확인할 수 있습니다.'
    } else if (text.includes('커뮤니티') || text.includes('코스')) {
      answer = '커뮤니티에서 “여행코스”를 검색하면 이용자들의 동선을 확인할 수 있습니다.'
    }

    return wait({ answer })
  },
}
