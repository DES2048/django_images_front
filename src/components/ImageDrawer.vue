<script setup lang="ts">
import { ref, watch } from "vue";
import { mdiPencil } from "@mdi/js";
import { useImagesStore } from "@/stores/images";
import { useUiStore } from "@/stores/ui";
import { storeToRefs } from "pinia";

// stores
const imagesStore = useImagesStore();
const uiStore = useUiStore()
const {currentImageIndex, images, currentImage } = storeToRefs(imagesStore)
// data
const imageLoading = ref(true);
const showGoToIndex = ref(false);
const newImageIndex = ref(1);

const img = ref<HTMLImageElement | null>(null);
watch(
  () => currentImage.value.name,
  () => {
    imageLoading.value = true;
    if (img.value) img.value.style.transform = "scale(1.0)";
  }
);

watch(showGoToIndex, (v) => {
  if (v) newImageIndex.value = currentImageIndex.value + 1;
});

function onImgLoad() {
  imageLoading.value = false;
}


</script>

<template>
  <div class="imageContainer2">
    
    <div class="image-name">
      <span @click="uiStore.openGoToImage = true">
        ({{ currentImageIndex + 1 }}/{{ images.length }}) {{ currentImage.name || "" }}
      </span>
      <v-icon :icon="mdiPencil" @click="uiStore.openRenameImage=true"></v-icon>
    </div>
    <div v-if="imageLoading">Loading image...</div>
    <img v-show="!imageLoading" :src="currentImage.url" class="responsive2" @load="onImgLoad" ref="img"
      @error="imageLoading = false" />
  </div>
</template>

<style scoped>
/* ??? */
.imageContainer2 {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100vh;
}

.image-name {
  text-align: center;
}

.responsive2 {
  flex-grow: 1;
  max-width: 100%;
  max-height: calc(100vh - 18px);
  object-fit: contain;
}

.responsive {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 95%;
}
</style>
