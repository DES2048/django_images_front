<script setup lang="ts">
import { useUiStore } from "@/stores/ui";
import {useImagesStore} from "@/stores/images";

import { storeToRefs } from 'pinia';
import { mdiPencil, mdiTag } from "@mdi/js";

const uiStore = useUiStore()
const imagesStore = useImagesStore();
const {images, currentImageIndex, currentImage} = storeToRefs(imagesStore)
</script>

<template>
    <div class="top-panel" v-if="uiStore.panelsVisible && images.length">
        <span @click="uiStore.openGoToImage = true">
            ({{ currentImageIndex + 1 }}/{{ images.length }}) {{ currentImage?.name || "" }}
        </span>
        <v-icon :icon="mdiPencil" @click="uiStore.openRenameImage = true"></v-icon>
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