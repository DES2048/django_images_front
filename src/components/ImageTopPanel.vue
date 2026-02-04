<script setup lang="ts">
import { useUiStore } from "@/stores/ui";
import { useImagesStore } from "@/stores/images";
import { useDialogStore } from "@/stores";
import { storeToRefs } from 'pinia';
import { mdiPencil, mdiTag, mdiFilter } from "@mdi/js";
import RenameImageDialog from "./dialogs/RenameImageDialog.vue";
import GoToImageDialog from "./dialogs/GoToImageDialog.vue";

const uiStore = useUiStore()
const imagesStore = useImagesStore();
const dialogStore = useDialogStore()

const { images, currentImageIndex, currentImage } = storeToRefs(imagesStore)

function openRenameImage() {
  dialogStore.createDialog(RenameImageDialog, {imageName: currentImage.value.name})
}

function openGoToImage() {
  dialogStore.createDialog(GoToImageDialog)
}

function editImageNameFilter() {
  const val = prompt("search image", imagesStore.imageNameFilter);
  imagesStore.imageNameFilter = val || "";
}
</script>

<template>
  <div class="top-panel" v-if="uiStore.panelsVisible && images.length">
    <span @click="openGoToImage">
      ({{ currentImageIndex + 1 }}/{{ images.length }}) {{ currentImage?.name || "" }}
    </span>
    <v-icon :icon="mdiPencil" @click="openRenameImage"></v-icon>
    <v-icon :icon="mdiFilter" @click="editImageNameFilter" />
    <v-icon :icon="mdiTag" @click="uiStore.openImageTags = true" />
  </div>
</template>

<style scoped>
.top-panel {
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    height: auto;
    padding-top: 0.25rem;
    background-color: rgba(1, 1, 1, 0.4);
    color: aliceblue
}
</style>
