<script setup lang="ts">
import ButtonsPanel from "@/components/ButtonsPanel.vue";
import ImageDrawer from "@/components/ImageDrawer.vue";
import ImageTopPanel from "@/components/ImageTopPanel.vue"
import Sidenav from "@/components/Sidenav2.vue";
import SettingsDialog from "@/components/dialogs/SettingsDialog.vue";
import RenameImageDialog from "@/components/dialogs/RenameImageDialog.vue";
import { onMounted, ref, watch } from "vue";
import { useImagesStore } from "@/stores/images";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "@/stores/settings";
import { useDialogStore } from "@/stores";
import { useUiStore } from '@/stores/ui'
import type { PickerSettings } from "@/models";
import CopyMoveToGalleryDialog from "@/components/dialogs/CopyMoveToGalleryDialog.vue";
import GoToImageDialog from "@/components/dialogs/GoToImageDialog.vue";
import AddEditGalleryDialog from "@/components/dialogs/AddEditGalleryDialog.vue";
import ImageTagsDialog from "@/components/dialogs/ImageTagsDialog.vue";
import AddEditTagDialog from "@/components/dialogs/AddEditTagDialog.vue";
import GalleryFilterDialog from "@/components/dialogs/GalleryFilterDialog.vue";
import { getGalleriesSettings } from "@/storage";

// stores
const imagesStore = useImagesStore()
const { images, randomMode, imagesFilter, imagesLoaded } = storeToRefs(imagesStore);
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const uiStore = useUiStore()
const dialogStore = useDialogStore()

// getters
const { nextImage, prevImage, deleteCurrentImage } = imagesStore;

// data
const error = ref("")

const appSettings = ref<PickerSettings>()

function shouldReloadImages(s1:PickerSettings, s2:PickerSettings) {
  return (
    s1.selectedGallery !== s2.selectedGallery ||
    s1.showMode !== s2.showMode ||
    s1.favoriteImagesMode !== s2.favoriteImagesMode ||
    JSON.stringify(s1.selectedTags?.sort()) !== JSON.stringify(s2.selectedTags?.sort())
  );
}

// watch settings changed
watch(settings, async (newSettings, oldSettings) => {
  if (!shouldReloadImages(newSettings, oldSettings)) {
    return
  }

  error.value = "";
  // set images filter
  if (settings.value.selectedGallery) {
    const selTags = getGalleriesSettings()[settings.value.selectedGallery]?.filter?.tags
    if (selTags) {
      imagesFilter.value.selectedTags = selTags
    }
  }

  try {
    // loading images
    await imagesStore.fetchImages();
  } catch (err) {
    error.value = (err as Error).message
  }

})

// watch images filter changed
watch(imagesFilter, async () => {
  
  error.value = "";

  try {
    // loading images
    await imagesStore.fetchImages();
  } catch (err) {
    error.value = (err as Error).message
  }

}, {deep: true})

// watch gallery emptiness
watch(()=>images.value.length ===0 && imagesLoaded.value, (val)=> {
  if(val) {
    error.value = "No images found in gallery or with current filter"
  }
})

async function reload() {

  try {
    // fetching settings
    await settingsStore.fetchSettings();
    appSettings.value = {...settings.value};

    // loading images
    //await imagesStore.fetchImages();
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
      <component :is="dialog.component" v-for="dialog in dialogStore.dialogs.values()" :key="dialog.guid" v-bind="{ guid: dialog.guid, ...dialog.props }"></component>
      <Sidenav v-model="uiStore.openSidenav" />
      <SettingsDialog v-if="uiStore.openSettings"/>
      <RenameImageDialog v-if="uiStore.openRenameImage" />
      <CopyMoveToGalleryDialog v-if="uiStore.openCopyMoveToGallery" />
      <GoToImageDialog v-if="uiStore.openGoToImage" />
      <AddEditGalleryDialog v-if="uiStore.openAddEditGallery" />
      <ImageTagsDialog v-if="uiStore.openImageTags" />
      <AddEditTagDialog v-if="uiStore._openAddEditTag" />
      <GalleryFilterDialog v-if="uiStore.openGalleryFilter" />
      <div class="error-message" v-if="error">{{ error }}</div>
      <ImageTopPanel />
      <ImageDrawer v-if="!error && images.length" v-touch="vTouchSettings" />
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
