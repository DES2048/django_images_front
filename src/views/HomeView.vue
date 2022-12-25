<script setup lang="ts">
import ButtonsPanel from "../components/ButtonsPanel.vue";
import ImageDrawer from "@/components/ImageDrawer.vue";
import Sidenav from "@/components/Sidenav.vue";
import api from "@/api";
import { onMounted, reactive, ref, computed } from "vue";
import { GalleryShowMode, type ImageInfo, type PickerSettings } from "@/models";

// functions for comparsions
function invertComparsion(cmp_result:number) {
  if (cmp_result > 0) {
    return -1;
  } else if (cmp_result < 0) {
    return 1;
  } else {
    return 0;
  }
}

function compareValues(a:number, b:number) {
  if (a == b) {
    return 0;
  } else if (a < b) {
    return -1;
  } else {
    return 1;
  }
}

// data
let settings: PickerSettings;
const images = ref<ImageInfo[]>([])
const error = ref("");
const currentImageIndex = ref(-1);
const sidenavOpen = ref(false);

// computed
const currentImage = computed(()=> {
  return images.value[currentImageIndex.value]
})

function resetData() {

}

async function reload() {
  error.value = "";
  images.value = []
  currentImageIndex.value = -1
  
  // fetching settings
  const data = await api.getSettings();
  settings = reactive(data);
  
  if (!settings.selectedGallery) {
    error.value = "Pick gallery in sidenav";
    return;
  }

  // loading images
  const imagesData = await api.getImages(settings.selectedGallery, settings.showMode);
  
    if (imagesData.length == 0) {
      error.value = "selected gallery did't return any image";
      return    
    }
    
    imagesData.sort((a, b) => {
      return invertComparsion(compareValues(a.mod_date, b.mod_date));
    });
    
    images.value = imagesData;
    currentImageIndex.value = 0; // set to first 
}
// hooks
onMounted(reload);

 // methods

  // navigation
  function nextImage() {
    if( (currentImageIndex.value+1) == images.value?.length) {
      return
    }
    currentImageIndex.value++
  }

  function prevImage() {
    if( currentImageIndex.value == 0) {
      return
    }
    currentImageIndex.value--
  }

  function randomImage() {
    if (images.value) {
      currentImageIndex.value = Math.floor(Math.random() * images.value.length);
    }
  }

  async function markImage() {
    error.value = ""
    if (images.value) {
      const img_info = await api.markImage(
        settings.selectedGallery,
        images.value[currentImageIndex.value].name
      );

      if (settings.showMode == GalleryShowMode.Unmarked) {
        images.value.splice(currentImageIndex.value,1);
        randomImage();
      } 
    }  
  }

  async function deleteImage() {
    error.value = ""
    const response = await api.deleteImage(settings.selectedGallery, currentImage.value.name)
    
    if (response.ok) {
      images.value.splice(currentImageIndex.value, 1)
      randomImage();
    }
  }

  // sidenav
  function handleOpenSidenav() {
    console.log("open")
    sidenavOpen.value = true
  }

  async function handleSettingsSave() {
    sidenavOpen.value = false;
    error.value = ""
    // if settings changed refresh
    const newSettings = await api.getSettings()

    if (!settings.isEqual(newSettings)) {
      reload();
    }
  }
</script>

<template>
  <main>
    <div class="container">
      <Sidenav :is-open="sidenavOpen" @on-settings-save="handleSettingsSave" @on-close="(sidenavOpen=false)"/>
      <div class="error-message"  v-if="error">{{error}}</div>
      <ImageDrawer v-if="images.length"
        :image-index="currentImageIndex" 
        :images-count="images.length"
        :image-info="images[currentImageIndex]"/>
      <ButtonsPanel
        @sidenav-open="handleOpenSidenav"
        @next-image="nextImage" 
        @prev-image="prevImage" 
        @random-image="randomImage"
        @mark-image="markImage"
        @delete-image="deleteImage"
         />
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