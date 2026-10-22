<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { useData } from 'vitepress'
import { haloAvatarSvg } from '../lib/halo-avatar'

const TEXT = {
  zh: {
    nameLabel: '数字人的名字',
    placeholder: '例如：每日资讯简报',
    hint: '名字要和 Halo 里显示的完全一致（包括大小写和空格），头像才会一样。输入的内容只在你的浏览器里处理，不会上传。',
    edgeSpace: '名字开头或结尾有空格，生成的头像会和 Halo 里不同。如果 Halo 里的名字没有这个空格，请删掉。',
    shape: '形状',
    round: '圆形',
    square: '方形',
    shapeHint: '圆形和 Halo 里一致，四角透明；方形铺满整张图，适合平台会自己裁剪头像的情况。',
    size: '图片尺寸',
    png: '下载 PNG',
    svg: '下载 SVG',
    busy: '正在生成…',
    failed: '生成图片失败。可以改下载 SVG，或换一个浏览器再试。',
    empty: '输入名字，在这里预览',
    inApp: '在 Halo 里的大小',
  },
  en: {
    nameLabel: 'Digital Human name',
    placeholder: 'e.g. Daily News Brief',
    hint: 'The name must match what Halo shows exactly, including capitals and spaces, or the avatar will differ. What you type stays in your browser and is never uploaded.',
    edgeSpace: 'The name starts or ends with a space, so the avatar will differ from the one in Halo. Remove the space if the name in Halo has none.',
    shape: 'Shape',
    round: 'Round',
    square: 'Square',
    shapeHint: 'Round matches Halo, with transparent corners. Square fills the whole image, for platforms that crop avatars themselves.',
    size: 'Image size',
    png: 'Download PNG',
    svg: 'Download SVG',
    busy: 'Creating…',
    failed: 'Could not create the image. Download the SVG instead, or try another browser.',
    empty: 'Type a name to preview',
    inApp: 'Sizes in Halo',
  },
}

const SIZES = [128, 256, 512, 1024]
const LARGE_PX = 160
const APP_SIZES = [44, 28, 20]

const { lang } = useData()
const t = computed(() => (lang.value.startsWith('en') ? TEXT.en : TEXT.zh))
const uid = useId()

const name = ref('')
const square = ref(false)
const pixels = ref(512)
const busy = ref(false)
const failed = ref(false)

// The name is hashed exactly as typed, as in the app; only a blank name has no face.
const hasName = computed(() => name.value.trim() !== '')
const edgeSpace = computed(() => hasName.value && name.value !== name.value.trim())

// The markup is built from palette colors and numbers only; the name never reaches it.
const largeSvg = computed(() =>
  hasName.value ? haloAvatarSvg(name.value, { size: LARGE_PX, square: square.value, maskId: `${uid}-large` }) : ''
)
const appSvgs = computed(() =>
  hasName.value
    ? APP_SIZES.map((size) => ({ size, svg: haloAvatarSvg(name.value, { size, maskId: `${uid}-${size}` }) }))
    : []
)
const exportSvg = computed(() => haloAvatarSvg(name.value, { size: pixels.value, square: square.value, maskId: 'halo-avatar' }))

// A link such as ?name=Daily%20News%20Brief opens the page with that name filled in.
onMounted(() => {
  const preset = new URLSearchParams(location.search).get('name')
  if (preset) name.value = preset
})

function fileName(extension: string): string {
  const slug = name.value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  return `halo-avatar-${slug || 'avatar'}.${extension}`
}

function save(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}

function rasterize(svg: string, px: number): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  return new Promise<Blob>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = px
      canvas.height = px
      canvas.getContext('2d')!.drawImage(image, 0, 0, px, px)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('empty canvas'))), 'image/png')
    }
    image.onerror = () => reject(new Error('svg did not load'))
    image.src = url
  }).finally(() => URL.revokeObjectURL(url))
}

function downloadSvg() {
  failed.value = false
  save(new Blob([exportSvg.value], { type: 'image/svg+xml;charset=utf-8' }), fileName('svg'))
}

async function downloadPng() {
  busy.value = true
  failed.value = false
  try {
    save(await rasterize(exportSvg.value, pixels.value), fileName('png'))
  } catch {
    failed.value = true
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="halo-avatar-gen">
    <div class="stage">
      <div class="preview" :class="{ empty: !hasName, square }" :style="{ width: LARGE_PX + 'px', height: LARGE_PX + 'px' }">
        <span v-if="hasName" class="halo-avatar-alive" v-html="largeSvg" />
        <span v-else class="placeholder">{{ t.empty }}</span>
      </div>
      <div v-if="hasName" class="sizes" role="group" :aria-label="t.inApp">
        <span v-for="item in appSvgs" :key="item.size" class="halo-avatar-alive" :title="item.size + ' px'" v-html="item.svg" />
        <span class="caption">{{ t.inApp }}</span>
      </div>
    </div>

    <div class="form">
      <label :for="`${uid}-name`" class="field-label">{{ t.nameLabel }}</label>
      <input :id="`${uid}-name`" v-model="name" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" :placeholder="t.placeholder" />
      <p class="note" :class="{ warn: edgeSpace }">{{ edgeSpace ? t.edgeSpace : t.hint }}</p>

      <fieldset class="shape">
        <legend class="field-label">{{ t.shape }}</legend>
        <label><input v-model="square" type="radio" :value="false" /> {{ t.round }}</label>
        <label><input v-model="square" type="radio" :value="true" /> {{ t.square }}</label>
      </fieldset>
      <p class="note">{{ t.shapeHint }}</p>

      <label :for="`${uid}-size`" class="field-label">{{ t.size }}</label>
      <select :id="`${uid}-size`" v-model.number="pixels">
        <option v-for="px in SIZES" :key="px" :value="px">{{ px }} × {{ px }}</option>
      </select>

      <div class="actions">
        <button type="button" class="primary" :disabled="!hasName || busy" @click="downloadPng">{{ busy ? t.busy : t.png }}</button>
        <button type="button" :disabled="!hasName" @click="downloadSvg">{{ t.svg }}</button>
      </div>
      <p v-if="failed" class="note warn" role="alert">{{ t.failed }}</p>
    </div>
  </div>
</template>
