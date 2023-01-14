<script setup lang="ts">
/* TODO
    Функциональность
    1) если не выбрана галерея или show mode не сохранять настройки, в идеале показывать tooltip
    2) рефактор кнопок для showMode
*/

import api from '@/api';
import { GalleryShowMode, type PickerSettings, type Gallery } from '@/models';
import { nextTick, ref, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';

// props
const props = defineProps<{
  modelValue: boolean
}>();

// emits
const emit = defineEmits(["update:modelValue"]);

interface GalleryEx extends Gallery {
  showMode: GalleryShowMode
}

// data
const settings = ref<PickerSettings>({ selectedGallery: "", showMode: GalleryShowMode.All })
const galleries = ref<GalleryEx[]>([])

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

// watch
watch(() => props.modelValue, async (openValue) => {

  if (openValue) {
    const [galls, settingsData] = await Promise.all([
      api.getGalleries(), api.getSettings()
    ]);

    settings.value = settingsData;
    galleries.value = galls.map(g => ({ ...g, showMode: settings.value.showMode }));

    await nextTick()

    window.addEventListener("click", clickOutsideEventListener)
  } else {
    galleries.value = []
    window.removeEventListener("click", clickOutsideEventListener)
  }
});

// events
function handleGalleryClick(gallery_id: string) {
  settings.value.selectedGallery = gallery_id
  settings.value.showMode = galleries.value.find((g) => g.slug === gallery_id)!.showMode
}
function handleShowModeButtonClick(gallery_id: string, showMode: GalleryShowMode) {
  galleries.value.find((g) => g.slug === gallery_id)!.showMode = showMode;

  settings.value.selectedGallery = gallery_id
  settings.value.showMode = showMode

}
async function handleSettingsSave() {
  if (!settings.value.selectedGallery) {
    return
  }
  const settingsStore = useSettingsStore()
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
          <a v-for="gallery in galleries" :key="gallery.slug"
            :class="{ selected: gallery.slug === settings.selectedGallery }">
            <span @click="handleGalleryClick(gallery.slug)" class="gallery-title">{{ gallery.title }}</span>
            <span>
              <button class="show-mode_button" :class="{ button_a: gallery.showMode === GalleryShowMode.Marked }"
                @click="handleShowModeButtonClick(gallery.slug, GalleryShowMode.Marked)">M</button>
              <button class="show-mode_button" :class="{ button_a: gallery.showMode === GalleryShowMode.Unmarked }"
                @click="handleShowModeButtonClick(gallery.slug, GalleryShowMode.Unmarked)"><s>M</s></button>
              <button class="show-mode_button" :class="{ button_a: gallery.showMode === GalleryShowMode.All }"
                @click="handleShowModeButtonClick(gallery.slug, GalleryShowMode.All)">*.*</button>
            </span>
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

.show-mode_button {
  cursor: pointer;
  color: #818181;
  background-color: inherit;
  font-size: 0.75em;
  outline: none;
  border: none;
}

.button_a {
  border: 2px solid red;
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
  padding: 8px 0px 8px 8px;
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