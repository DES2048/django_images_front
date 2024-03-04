<script setup lang="ts">
import ButtonsPanel from "@/components/ButtonsPanel.vue";
import ImageDrawer from "@/components/ImageDrawer.vue";
import Sidenav from "@/components/Sidenav2.vue";
import SettingsDialog from "@/components/SettingsDialog.vue";
import RenameImageDialog from "@/components/RenameImageDialog.vue";
import { onMounted, ref, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/settings";
import { useUiStore } from '@/stores/ui'
import type { PickerSettings } from "@/models";

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

const appSettings = ref<PickerSettings>()

function shouldReloadImages(s1:PickerSettings, s2:PickerSettings) {
  return (
    s1.selectedGallery !== s2.selectedGallery ||
    s1.showMode !== s2.showMode ||
    s1.favoriteImagesMode !== s2.favoriteImagesMode
  );
}
// watch settings changed
watch(settings, async (newSettings, oldSettings) => {
  if (!shouldReloadImages(newSettings, oldSettings)) {
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
    appSettings.value = {...settings.value};

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
const vTouchSettings = {
  left: ()=>onSwipe("left"),
  right: ()=>onSwipe("right")
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
      <SettingsDialog v-if="uiStore.openSettings"/>
      <RenameImageDialog v-if="uiStore.openRenameImage" />
      <div class="error-message" v-if="error">{{ error }}</div>
      <ImageDrawer v-if="!error && images.length" :image-index="currentImageIndex" :images-count="images.length"
        :image-info="images[currentImageIndex]" v-touch="vTouchSettings" />
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
