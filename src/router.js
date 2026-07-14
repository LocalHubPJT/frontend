import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TravelView from './views/TravelView.vue'
import TravelDetailView from './views/TravelDetailView.vue'
import BoardView from './views/BoardView.vue'
import PostDetailView from './views/PostDetailView.vue'
import PostFormView from './views/PostFormView.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: HomeView },
    { path: '/travel', component: TravelView },
    { path: '/travel/:id', component: TravelDetailView },
    { path: '/board', component: BoardView },
    { path: '/board/write', component: PostFormView },
    { path: '/board/:id', component: PostDetailView },
    { path: '/board/:id/edit', component: PostFormView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
