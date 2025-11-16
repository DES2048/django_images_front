<script setup lang="ts">
/* TODO
    Функциональность
    1) если не выбрана галерея или show mode не сохранять настройки, в идеале показывать tooltip
    2) рефактор кнопок для showMode
*/

import { nextTick, ref, watch } from "vue";
import GalleryActions from "./GalleryActions.vue";
import useSidenav from "@/composables/useSidenav";
import { useUiStore } from "@/stores/ui";
import { useDialogStore } from "@/stores";
import {
  mdiCog,
  mdiPlusCircleOutline,
  mdiPlusCircle,
  mdiFilter,
} from "@mdi/js";
import { tagsApi } from "@/api";
import { type TagWithCount } from "@/models";
import { GalleryShowMode } from "@/models/settings";
import ShowModeSwitcher from "./ShowModeSwitcher.vue";
import SettingsDialog from "./dialogs/SettingsDialog.vue";

// props
const props = defineProps<{
  modelValue: boolean;
}>();

// emits
const emit = defineEmits(["update:modelValue"]);

// data
const {
  settings,
  galleries,
  tags,
  selectedTags,
  favGallery,
  fetchData,
  saveSettings,
  clear,
  handleSelectGallery,
  handleSelectGalleryShowMode,
  handleSelectFav,
  handleSelectFavShowMode,
  pinUnpinGallery,
  currentTab,
  filterShowMode,
  resetSelectedTags,
} = useSidenav();

//const filterShowMode = ref(DEFAULT_SHOW_MODE)

const uiStore = useUiStore();
const dialogStore = useDialogStore()

// refs
const sidenavRef = ref<HTMLElement | null>(null);

function clickOutsideEventListener(e: MouseEvent) {
  if (!sidenavRef.value) {
    return;
  }
  if (!sidenavRef.value.contains(e.target as HTMLElement)) {
    emit("update:modelValue", false);
  }
}
const saveIcon = new URL("../assets/icons8-save-30.png", import.meta.url).href;

// watch
watch(
  () => props.modelValue,
  async (openValue) => {
    if (openValue) {
      // set show mode from settings and sort
      //if (currentTab.value === "galleries") {
      await fetchData();
      //} else if (currentTab.value === "tags") {
      //tags.value = await tagsApi.list()
      //selectedTags.value = settings.value.selectedTags
      //}
      await nextTick();

      window.addEventListener("click", clickOutsideEventListener);
    } else {
      clear()
      window.removeEventListener("click", clickOutsideEventListener);
    }
  }
);

async function handleSettingsSave() {
  await saveSettings();
  emit("update:modelValue", false);
}

function handleOpenSettings() {
  emit("update:modelValue", false);
  dialogStore.createDialog(SettingsDialog)
}
function handleAddGalllery() {
  uiStore.addMode = true
  uiStore.openAddEditGallery = true
}
</script>

<template>
  <div class="sidenav" :class="{ 'sidenav-open': modelValue }" ref="sidenavRef">
    <div class="sidenav-content">
      <div class="sidenav-title">
        <h2>Menu</h2>
        <v-icon :icon="mdiCog" color="rgb(240, 248, 255)" @click="handleOpenSettings"></v-icon>
        <v-icon :icon="mdiPlusCircleOutline" color="rgb(240, 248, 255)" @click="handleAddGalllery"></v-icon>
        <img :src="saveIcon" class="save-button" @click="handleSettingsSave" />
        <a href="#" class="closebtn" id="sidenavClose" @click="$emit('update:modelValue', false)">&times;</a>
      </div>
      <div class="galleries-container">
        <v-tabs v-model="currentTab" grow>
          <v-tab value="galleries">
            Galleries
          </v-tab>
          <v-tab value="filter">
            <v-icon :icon="mdiFilter" color="red" v-if="settings.selectedTags?.length" />
            Filter
          </v-tab>
        </v-tabs>
        <v-window v-model="currentTab">
          <v-window-item value="galleries">
            <!-- FAV-->
            <a href="#" :class="{ selected: settings.favoriteImagesMode }" @click="handleSelectFav">
              <span>Fav</span>
              <ShowModeSwitcher :show-mode="favGallery.showMode" @show-mode-click="handleSelectFavShowMode" />
            </a>
            <a v-for="gallery in galleries" :key="gallery.slug" :class="{
              selected: !settings.favoriteImagesMode &&
                gallery.slug === settings.selectedGallery,
            }">
              <span @click="handleSelectGallery(gallery.slug)" class="gallery-title">
                {{ gallery.title }}<sup v-if="gallery.isFilter">
                  <v-icon :icon="mdiFilter" color="red" size="small" @click="uiStore.showGalleryFilter(gallery.slug)" />
                </sup></span>
              <GalleryActions :show-mode="gallery.showMode" :gallery="gallery" @show-mode-click="handleSelectGalleryShowMode"
                @pin-unpin-click="pinUnpinGallery" />
            </a>
          </v-window-item>
          <v-window-item value="filter">
            <v-container>
              <v-row>
                <v-col>Show Mode:</v-col>
                <v-col>
                  <v-btn-toggle v-model="filterShowMode" mandatory divided shaped density="compact" size="small"
                    selected-class="filter-show-mode-selected">
                    <v-btn :value="GalleryShowMode.Marked">M</v-btn>
                    <v-btn :value="GalleryShowMode.Unmarked"><s>M</s></v-btn>
                    <v-btn :value="GalleryShowMode.All">*.*</v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>
              <v-divider />
                <h3>Tags</h3>
              <v-divider></v-divider>
              <v-row>
                <v-col><v-btn @click="resetSelectedTags">Reset</v-btn></v-col>
              </v-row>
            <v-chip-group v-model="selectedTags" selected-class="text-primary" column multiple>
              <v-icon :icon="mdiPlusCircle" @click="uiStore.openAddEditTag(true)" />
              <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                {{ tag.images_count }} {{ tag.name }}
              </v-chip>
            </v-chip-group>
            </v-container>
          </v-window-item>
        </v-window>
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
  z-index: 5;
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
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
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

.filter-show-mode-selected {
  border: 1px solid red;
}
</style>
