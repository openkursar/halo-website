<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{ mac: string; other: string }>()

// Server render shows the macOS keys; the browser switches on other systems.
const keys = ref(props.mac)
onMounted(() => {
  if (!/Mac|iPhone|iPad/i.test(navigator.userAgent)) keys.value = props.other
})
</script>

<template>
  <span class="halo-shortcut"><kbd v-for="k in keys.split(' ')" :key="k">{{ k }}</kbd></span>
</template>
