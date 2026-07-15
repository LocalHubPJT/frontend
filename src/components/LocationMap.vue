<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
})

const mapEl = ref(null)
const failed = ref(false)

let map
let layer

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function render() {
  if (!map || !layer) {
    return
  }

  layer.clearLayers()
  const points = []

  props.locations.forEach((item) => {
    const latitude = Number(item.latitude ?? item.mapy)
    const longitude = Number(item.longitude ?? item.mapx)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    const name = item.name ?? item.title ?? '장소 정보'
    const category = item.category ?? item.content_type_name ?? ''
    const address =
      item.address ?? [item.addr1, item.addr2].filter(Boolean).join(' ')

    const marker = L.circleMarker([latitude, longitude], {
      radius: 8,
      weight: 3,
      fillOpacity: 0.8,
    }).bindPopup(
      `<b>${escapeHtml(name)}</b><br>${escapeHtml(category)}<br><small>${escapeHtml(address)}</small>`,
    )

    marker.addTo(layer)
    points.push([latitude, longitude])
  })

  if (points.length) {
    map.fitBounds(points, {
      padding: [28, 28],
      maxZoom: 14,
    })
  }
}

onMounted(() => {
  try {
    map = L.map(mapEl.value, {
      scrollWheelZoom: true,
    }).setView([36.3504, 127.3845], 12)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    layer = L.layerGroup().addTo(map)
    render()

    setTimeout(() => map?.invalidateSize(), 100)
  } catch {
    failed.value = true
  }
})

watch(() => props.locations, render, { deep: true })

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <div
    v-show="!failed"
    ref="mapEl"
    class="map"
    aria-label="대전 여행지 지도"
  />
  <p v-if="failed" class="map-fallback">
    지도를 표시하지 못했지만 여행 정보는 계속 이용할 수 있습니다.
  </p>
</template>
