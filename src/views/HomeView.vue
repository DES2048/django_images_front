<script setup lang="ts">
import ButtonsPanel from "@/components/ButtonsPanel.vue";
import ImageDrawer from "@/components/ImageDrawer.vue";
import Sidenav from "@/components/Sidenav.vue";
import { onMounted, ref, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/settings";
import { isPickerSettingsEqual } from "@/models";

// stores
const imagesStore = useImagesStore()
const { images, currentImageIndex} = storeToRefs(imagesStore);
const settingsStore = useSettingsStore()
const {settings} = storeToRefs(settingsStore)
// getters
const {nextImage, prevImage, markCurrentImage, deleteCurrentImage, randomImage} = imagesStore;

// data
const error = ref("")

// watchers
watch(settings, async (newSettings, oldSettings)=> {
  if (isPickerSettingsEqual(newSettings, oldSettings)) {
    return 
  }

  error.value = "";

  try { 
  // loading images
  await imagesStore.fetchImages(settings.value!.selectedGallery,settings.value!.showMode);
  } catch(err) {
    error.value = (err as Error).message
  }

})


async function reload() {

  imagesStore.resetImages()

  try {
    // fetching settings
    await settingsStore.fetchSettings();

  // loading images
  await imagesStore.fetchImages(settings.value!.selectedGallery,settings.value!.showMode);
  } catch(err) {
    error.value = (err as Error).message
  }
}

// hooks
onMounted(reload);

// sidenav
const sidenavOpen = ref(false);

function handleOpenSidenav() {
  console.log("open")
  sidenavOpen.value = true
}

async function handleSettingsSave() {
  sidenavOpen.value = false;
}

</script>

<template>
  <main>
    <div class="container">
      <Sidenav v-model="sidenavOpen" />
      <div class="error-message" v-if="error">{{ error }}</div>
      <ImageDrawer v-if="images.length" :image-index="currentImageIndex" :images-count="images.length"
        :image-info="images[currentImageIndex]" />
      <ButtonsPanel @sidenav-open="handleOpenSidenav" @next-image="nextImage" @prev-image="prevImage"
        @random-image="randomImage" @mark-image="markCurrentImage" @delete-image="deleteCurrentImage" />
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