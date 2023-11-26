<script setup lang="ts">
/* TODO
    Функциональность
    1) если не выбрана галерея или show mode не сохранять настройки, в идеале показывать tooltip
    2) рефактор кнопок для showMode
*/

import api from '@/api';
import type { GalleryShowMode, Gallery, PickerSettings } from '@/models';
import { nextTick, ref, watch } from 'vue';
//import { storeToRefs } from "pinia";
import { useSettingsStore } from '@/stores/settings';
import GalleryActions from './GalleryActions.vue';
import { defaultSettings } from '@/utils';

// types
interface GalleryEx extends Gallery {
  showMode: GalleryShowMode
}

// props
const props = defineProps<{
  modelValue: boolean
}>();

// emits
const emit = defineEmits(["update:modelValue"]);

// data
const settings = ref<PickerSettings>(defaultSettings())
const galleries = ref<GalleryEx[]>([])

// store
const settingsStore = useSettingsStore()
//const {settings} = storeToRefs(settingsStore)

// refs
const sidenavRef = ref<HTMLElement | null>(null)

function clickOutsideEventListener(e: MouseEvent) {
  if (!sidenavRef.value) {
    return
  }
  if (!sidenavRef.value.contains(e.target as HTMLElement)) {
    emit('update:modelValue', false)
  }
}
const saveIcon = new URL("../assets/icons8-save-30.png",import.meta.url).href

// methods
function sortGalleries(galleries:GalleryEx[]): GalleryEx[] {
  const outGalleries: GalleryEx[] = []
  // move selected on top if any
  if (settings.value.selectedGallery !== "") {
      const idx = galleries.findIndex((g)=>g.slug===settings.value.selectedGallery)
      if (idx >=0) {
        outGalleries[0] = galleries.splice(idx,1)[0]
      }
    }
    // move pinned next if any
    const pinned = galleries.filter((g)=>g.pinned)
    if (pinned.length>0) {
      outGalleries.push(...pinned)
    }
    // add rest of galleries
    const rest = galleries.filter((g)=>!g.pinned)
    if (rest.length>0) {
      outGalleries.push(...rest)
    }
    return outGalleries
}

// watch
watch(() => props.modelValue, async (openValue) => {

  if (openValue) {
    let [galls, settingsData] = await Promise.all([
      api.getGalleries(), api.getSettings()
    ]);
    settings.value = settingsData

    // set show mode from settings and sort
    galleries.value = sortGalleries(
      galls.map((g):GalleryEx => ({ ...g, showMode: settings.value.showMode }))
    )

    /* if selected gallery present move it on top of list
    if (settings.value.selectedGallery !== "") {
      const idx = galls.findIndex((g)=>g.slug===settings.value.selectedGallery)
      if (idx>=0) {
        const elem = galls[idx]
        galls.splice(idx,1)
        galls.unshift(elem)
      }
    } */
    
    await nextTick()

    window.addEventListener("click", clickOutsideEventListener)
  } else {
    galleries.value = []
    window.removeEventListener("click", clickOutsideEventListener)
  }
});


// events
function handleGalleryClick(gallery_id: string) {
  settings.value.favoriteImagesMode = false
  settings.value.selectedGallery = gallery_id
  settings.value.showMode = galleries.value.find((g) => g.slug === gallery_id)!.showMode
}

function handleShowModeButtonClick(gallery_id: string, showMode: GalleryShowMode) {
  galleries.value.find((g) => g.slug === gallery_id)!.showMode = showMode;

  settings.value.selectedGallery = gallery_id
  settings.value.showMode = showMode

}
async function handlePinUnpin(gallery_id:string, pin:boolean) {
  const gallery =  await api.pinUnpinGallery(gallery_id, pin)
  galleries.value.find((g) => g.slug === gallery_id)!.pinned = gallery.pinned;
  galleries.value = sortGalleries(galleries.value)
}

async function handleSettingsSave() {
  if (!settings.value.selectedGallery && !settings.value.favoriteImagesMode) {
    return
  }
  
  await settingsStore.saveSettings(settings.value);
  emit('update:modelValue', false)
}
</script>

<template>
  <div class="sidenav" :class="{ 'sidenav-open': modelValue }" ref="sidenavRef">
    <div class="sidenav-content">
      <div class="sidenav-title">
        <h2>Settings</h2>
        <img :src="saveIcon" class="save-button" @click="handleSettingsSave"/>
        <a href="#" class="closebtn" id="sidenavClose" @click="$emit('update:modelValue', false)">&times;</a>
      </div>
        <div class="galleries-container">
          <!-- FAV-->
          <a href="#" :class="{selected: settings.favoriteImagesMode }" @click="settings.favoriteImagesMode=true">Fav</a>
          <a v-for="gallery in galleries" :key="gallery.slug"
            :class="{ selected: !settings.favoriteImagesMode && gallery.slug === settings.selectedGallery }">
            <span @click="handleGalleryClick(gallery.slug)" class="gallery-title">{{ gallery.title }}</span>
            <GalleryActions :show-mode="gallery.showMode" :gallery="gallery"
              @show-mode-click="handleShowModeButtonClick" @pin-unpin-click="handlePinUnpin"/>
          </a>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* sidenav */

.sidenav {
  height: 100vh;
  /* 100% Full-height */
  width: 0;
  max-width: 0;
  position: fixed;
  /* Stay in place */
  z-index: 1;
  /* Stay on top */
  top: 0;
  /* Stay at the top */
  left: 0;
  overflow: hidden;
  /* Disable horizontal scroll */
  transition: 0.5s;
  /* 0.5 second transition effect to slide in the sidenav */
}

.sidenav-open {
  box-sizing: border-box;
  width: 100%;
  max-width: 430px;
}
.save-button {
  cursor: pointer;
  margin-left: 0.5rem;
}
.sidenav-content {
  padding: 10px 10px 10px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: black;
  /* Black*/
  color: #818181;
}

.sidenav-content a {
  text-decoration: none;
  color: #818181;
  cursor: pointer;
}

.sidenav-content a:hover {
  color: #f1f1f1;
}

.sidenav-title {
  display: flex;
  align-items: center;
  font-size: 25px;
}

.sidenav-title h2 {
  margin: 0;
  font-size: 25px;
}

/* Position and style the close button (top right corner) */
.sidenav-title .closebtn {
  font-size: 30px;
  margin-left: auto;
  font-weight: 600;
}
/* galleries */
.galleries-container {
  flex: 1 1 auto;
  max-height: 100vh;
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
/* Hide scrollbar for Chrome, Safari and Opera */
.galleries-container::-webkit-scrollbar {
    display: none;
}
.gallery-title {
  flex-grow: 1;
}
/* The navigation menu links */
.galleries-container a {
  padding: 8px 0px 8px 0px;
  font-size: 25px;
  display: block;
  transition: 0.3s;
  display: flex;
  justify-content: space-between;
}
.galleries-container a.selected {
  border: 1px solid #f1f1f1;
}
</style>