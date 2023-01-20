<script setup lang="ts">
import { useImagesStore } from '@/stores/images';
import { useSidenavStore } from '@/stores/sidenav';
import { storeToRefs } from 'pinia';

const imagesStore = useImagesStore()
const sidenavStore = useSidenavStore()
const { shuffleImages, firstImage, lastImage, prevImage, nextImage,
  deleteCurrentImage, markCurrentImage } = imagesStore

const { randomMode } = storeToRefs(imagesStore);

const shuffleIcon = new URL("../assets/icons8-shuffle-30.png", import.meta.url).href;

function handleRandomImage() {
  randomMode.value = !randomMode.value
}

function handleDeleteImage() {
  if (confirm("Are you sure for delete this image?")) {
    deleteCurrentImage()
  }
}
</script>

<template>
  <div class="buttons-panel">
    <a href="#" class="btn-panel" @click="sidenavStore.open=true">
      <!--<img src="{% static 'image_picker/svg/settings.svg' %}" > -->
      &#9881;
    </a>
    <a href="#" class="btn-panel" :class="{ 'toggle-btn': randomMode }" @click="handleRandomImage">random</a>
    <a href="#" class="btn-panel" @click="shuffleImages"><img class="shuffle-icon" :src="shuffleIcon" /></a>
    <a href="#" class="btn-panel" @click="firstImage">&lt;&lt;</a>
    <a href="#" class="btn-panel" @click="prevImage">&lt;</a>
    <a href="#" class="btn-panel" @click="nextImage">&gt;</a>
    <a href="#" class="btn-panel" @click="lastImage">&gt;&gt;</a>
    <a href="#" class="btn-panel" @click="handleDeleteImage">&#10006;</a>
    <a href="#" class="btn-panel" @click="markCurrentImage">&#10004;</a>
  </div>
</template>

<style scoped>
/* buttons panel */
.buttons-panel {
  display: flex;
  justify-content: space-around;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  height: auto;
  background-color: rgba(1, 1, 1, 0);
}

.btn-panel {
  font-size: 16px;
  color: aliceblue;
  font-weight: 600;
  text-decoration: none !important;
}

.toggle-btn {
  border: 1px solid red;
  border-radius: 0.25rem;
  padding: 0 0.5rem;
}

.btn-panel:focus,
.btn-panel:active {
  outline: none !important;
  box-shadow: none !important;
}

.shuffle-icon {
  width: 1rem;
  height: 1rem;
}
</style>