<script setup lang="ts">
import { computed } from 'vue'
import { useImagesStore } from '@/stores/images';
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import { mdiMenu, mdiShuffleVariant, mdiDotsVertical, mdiStar, mdiStarOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'

// store
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()
const { shuffleImages, firstImage, lastImage, prevImage, nextImage,
  deleteCurrentImage, markCurrentImage, unmarkCurrentImage, addCurrentImageToFav,
  deleteCurrentImageFromFav } = imagesStore

const { randomMode, currentImage, imagesLoaded } = storeToRefs(imagesStore);
const { settings } = storeToRefs(settingsStore)

//const shuffleIcon = new URL("../assets/icons8-shuffle-30.png", import.meta.url).href;

// display
const { mobile } = useDisplay()

// computed
const markToggle = computed(() => {
  if (!imagesLoaded.value) {
    return false;
  } else {
    return currentImage.value.marked
  }
})

const favIconProps = computed(()=>{
  return currentImage?.value?.is_fav ?
    {
      icon: mdiStar,
      color: "yellow"
    }: {
      icon: mdiStarOutline,
      color: "white"
    }
})

// event handlers
function handleRandomImage() {
  randomMode.value = !randomMode.value
}

async function handleDeleteImage() {
  const confirmMsg = settings.value.favoriteImagesMode ?
    "Are u sure for delete image from fav?"
    : "Are you sure for delete this image?"
  if (confirm(confirmMsg)) {
    await deleteCurrentImage()
  }
}

async function handleMarkUnmark() {
  if (!currentImage.value) return

  if (!currentImage.value.marked)
    await markCurrentImage();
  else
    await unmarkCurrentImage();
}

async function handleFavImage() {
  if (currentImage.value && currentImage.value.is_fav) {
    await deleteCurrentImageFromFav()
  } else if (currentImage.value && !currentImage.value.is_fav) {
    await addCurrentImageToFav()
  }
}
</script>

<template>
  <div class="buttons-panel">

    <a href="#" class="btn-panel" @click="uiStore.openSidenav = true">
      <!--<img src="{% static 'image_picker/svg/settings.svg' %}" > -->
      <!--&#9881;-->
      <v-icon :icon="mdiMenu" color="rgb(240, 248, 255)"></v-icon>
    </a>
    <a href="#" class="btn-panel" :class="{ 'toggle-btn': randomMode }" @click="handleRandomImage">R</a>
    <a href="#" class="btn-panel" @click="shuffleImages"><v-icon :icon="mdiShuffleVariant"
        color="rgb(240, 248, 255)"></v-icon></a>
    <a href="#" class="btn-panel" @click="firstImage">&lt;&lt;</a>
    <a href="#" class="btn-panel" @click="prevImage" v-if="!mobile">&lt;</a>
    <a href="#" class="btn-panel" @click="nextImage" v-if="!mobile">&gt;</a>
    <a href="#" class="btn-panel" @click="lastImage">&gt;&gt;</a>
    <v-icon v-if="!settings.favoriteImagesMode" v-bind="favIconProps" 
      @click="handleFavImage"/>
    <a href="#" class="btn-panel" @click="handleDeleteImage">&#10006;</a>
    <a href="#" class="btn-panel" :class="{ 'toggle-btn': markToggle }" @click="handleMarkUnmark">&#10004;</a>
    
    <v-menu>
      <template v-slot:activator="{props}">
        <v-icon :icon="mdiDotsVertical" v-bind="props"></v-icon>
      </template>
      <v-list>
        <v-list-item @click="uiStore.openCopyMoveToGallery=true">
          <v-list-item-title>Copy/Move</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
/* buttons panel */
.buttons-panel {
  
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
  height: auto;
  padding-bottom: 0.25rem;
  background-color: rgba(1, 1, 1, 0);
}

.btn-panel {
  font-size: 16px;
  color: aliceblue;
  font-weight: 600;
  text-decoration: none !important;
}

@media screen and (max-width:425px) {
  .btn-panel {
    font-size: 20px;
  }
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