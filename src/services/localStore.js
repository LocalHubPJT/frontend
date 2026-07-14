import { initialPosts } from '../data/mock'
const KEY = 'daejeon-localhub-posts'
function read(){ const raw=localStorage.getItem(KEY); if(!raw){localStorage.setItem(KEY,JSON.stringify(initialPosts)); return [...initialPosts]} try{return JSON.parse(raw)}catch{return [...initialPosts]} }
function write(posts){ localStorage.setItem(KEY,JSON.stringify(posts)) }
export const localPosts = {
  list(keyword=''){ const q=keyword.trim().toLowerCase(); return read().filter(p=>!q||`${p.title} ${p.content} ${p.category}`.toLowerCase().includes(q)).sort((a,b)=>b.id-a.id) },
  get(id){ const posts=read(); const post=posts.find(p=>p.id===Number(id)); if(!post) throw new Error('게시글을 찾을 수 없습니다.'); post.view_count=(post.view_count||0)+1; write(posts); return post },
  peek(id){ const post=read().find(p=>p.id===Number(id)); if(!post) throw new Error('게시글을 찾을 수 없습니다.'); return post },
  create(payload){ const posts=read(); const id=Math.max(0,...posts.map(p=>p.id))+1; const post={id,...payload,view_count:0,created_at:new Date().toISOString()}; posts.push(post); write(posts); return post },
  update(id,payload){ const posts=read(); const i=posts.findIndex(p=>p.id===Number(id)); if(i<0) throw new Error('게시글을 찾을 수 없습니다.'); if(posts[i].password!==payload.password) throw new Error('비밀번호가 일치하지 않습니다.'); posts[i]={...posts[i],title:payload.title,content:payload.content,category:payload.category}; write(posts); return posts[i] },
  remove(id,password){ const posts=read(); const post=posts.find(p=>p.id===Number(id)); if(!post) throw new Error('게시글을 찾을 수 없습니다.'); if(post.password!==password) throw new Error('비밀번호가 일치하지 않습니다.'); write(posts.filter(p=>p.id!==Number(id))) },
}
