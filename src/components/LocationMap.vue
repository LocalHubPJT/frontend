<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
const props=defineProps({locations:{type:Array,default:()=>[]}})
const mapEl=ref(null),failed=ref(false); let map; let layer
function render(){ if(!map)return; layer?.clearLayers(); const points=[]; props.locations.forEach(item=>{if(!item.latitude||!item.longitude)return; const marker=L.circleMarker([item.latitude,item.longitude],{radius:8,weight:3,fillOpacity:.8}).bindPopup(`<b>${item.name}</b><br>${item.category}<br><small>${item.address}</small>`); marker.addTo(layer); points.push([item.latitude,item.longitude])}); if(points.length) map.fitBounds(points,{padding:[28,28],maxZoom:14}) }
onMounted(()=>{try{map=L.map(mapEl.value,{scrollWheelZoom:false}).setView([36.3504,127.3845],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);layer=L.layerGroup().addTo(map);render();setTimeout(()=>map.invalidateSize(),100)}catch{failed.value=true}})
watch(()=>props.locations,render,{deep:true}); onBeforeUnmount(()=>map?.remove())
</script>
<template><div v-show="!failed" ref="mapEl" class="map" aria-label="대전 여행지 지도"></div><p v-if="failed" class="map-fallback">지도를 표시하지 못했지만 여행 정보는 계속 이용할 수 있습니다.</p></template>
