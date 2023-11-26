<script setup lang="ts">
import ButtonsPanel from "@/components/ButtonsPanel.vue";
import ImageDrawer from "@/components/ImageDrawer.vue";
import Sidenav from "@/components/Sidenav.vue";
import { onMounted, ref, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/settings";
import { useUiStore } from '@/stores/ui'
import { isPickerSettingsEqual } from "@/models";

// stores
const imagesStore = useImagesStore()
const { images, currentImageIndex, randomMode } = storeToRefs(imagesStore);
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const uiStore = useUiStore()

// getters
const { nextImage, prevImage, deleteCurrentImage } = imagesStore;

// data
const error = ref("")

// watch settings changed
watch(settings, async (newSettings, oldSettings) => {
  if (isPickerSettingsEqual(newSettings, oldSettings)) {
    return
  }

  error.value = "";

  try {
    // loading images
    await imagesStore.fetchImages();
  } catch (err) {
    error.value = (err as Error).message
  }

})


async function reload() {

  imagesStore.resetImages()

  try {
    // fetching settings
    await settingsStore.fetchSettings();

    // loading images
    await imagesStore.fetchImages();
  } catch (err) {
    error.value = (err as Error).message
  }
}

// hooks
onMounted(reload);

function confirmDeleteImage() {
  if (confirm("Are you sure for delete this image?")) {
    deleteCurrentImage()
  }
}

function onSwipe(dir: string) {
  console.log(dir)
  switch (dir) {
    case 'left':
      nextImage()
      break
    case 'right':
      prevImage()
      break
  }
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
  console.log("keydown")
  switch (e.code) {
    case "KeyR":
      randomMode.value = !randomMode.value;
      break;
    case "ArrowLeft":
      prevImage()
      break;
    case "ArrowRight":
      nextImage()
      break;
    case "Delete":
      confirmDeleteImage()
      break
    default:
      break;
  }
})

</script>

<template>
  <main>
    <div class="container">
      <Sidenav v-model="uiStore.openSidenav" />
      <div class="error-message" v-if="error">{{ error }}</div>
      <ImageDrawer v-if="!error && images.length" :image-index="currentImageIndex" :images-count="images.length"
        :image-info="images[currentImageIndex]" v-touch:swipe="onSwipe" />
      <ButtonsPanel />
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  height: 100vh;
}

.error-message {
  text-align: center;
  color: red;
  padding: 10px;
}
</style>