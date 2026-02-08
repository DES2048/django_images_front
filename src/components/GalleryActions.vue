<script setup lang="ts">
/* __placeholder__ */
import type { Gallery, GalleryShowMode } from '@/models';
import ToggleButton from './ToggleButton.vue';
import ShowModeSwitcher from './ShowModeSwitcher.vue'
import { mdiDotsVertical, mdiFilter, mdiPencil, mdiArrowUpDown, mdiTrashCan } from '@mdi/js';
import { useDialogStore } from "@/stores";
import api from '@/api';
import { getGalleriesSettings, saveGallerySettings } from "@/storage";
import SortDialog from "./dialogs/SortDialog.vue";
import { ref } from "vue";
import { createAddEditGalleryDialog, createGalleryFilterDialog } from './dialogs/helpers';

// props
const props = defineProps<{
  gallery: Gallery
  showMode: GalleryShowMode
}>();

// stores
const dialogStore = useDialogStore()

// data
const sortFields = ref(["-mod_time", "mod_time", "name", "-name"])
const sortField = ref("")

// emits
const emit = defineEmits<{
  (e: 'showModeClick', gallerySlug: string, showMode: GalleryShowMode): void
  (e: 'pinUnpinClick', gallerySlug: string, pin: boolean): void
}>()

function openSortDialog() {

  const gallsSettings = getGalleriesSettings();

  sortField.value = gallsSettings[props.gallery.slug]?.sorting || "-mod_time"

  dialogStore.createDialog(SortDialog, {
    selField: sortField.value,
    sortFields: sortFields.value,
    onSubmit: (field:string) => {
      saveGallerySettings(props.gallery.slug, {
        sorting: field
      })
    }
  })
}

function openGalleryFilter(galleryId: string) {
  createGalleryFilterDialog({ galleryId })
}

function handleEditGallery() {
  createAddEditGalleryDialog({galleryId:props.gallery.slug, addMode:false})
}

async function handleDeleteGallery() {
  if (confirm(`Are you sure delete gallery "${props.gallery.title}"?`)) {
    await api.deleteGallery(props.gallery.slug)
  }
}
</script>

<template>
  <span class="actions">
    <ToggleButton :value="gallery.pinned" :toggled-value="true"
      @on-toggle="emit('pinUnpinClick', gallery.slug, !props.gallery.pinned)">&#128204;</ToggleButton>
    <ShowModeSwitcher :showMode="showMode"
      @show-mode-click="(showMode) => emit('showModeClick', gallery.slug, showMode)" />
    <v-menu location="right">
      <template v-slot:activator="{ props }">
        <v-icon :icon="mdiDotsVertical" v-bind="props" size="small" class="menu-icon"></v-icon>
      </template>
      <v-list>
        <v-list-item @click="handleEditGallery">
          <template v-slot:prepend>
            <v-icon :icon="mdiPencil"></v-icon>
          </template>
          <v-list-item-title>Edit</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openGalleryFilter(gallery.slug)">
          <template v-slot:prepend>
            <v-icon :icon="mdiFilter"></v-icon>
          </template>
          <v-list-item-title>Filter</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openSortDialog">
          <template v-slot:prepend>
            <v-icon :icon="mdiArrowUpDown"></v-icon>
          </template>
          <v-list-item-title>Sort</v-list-item-title>
        </v-list-item>
        <v-list-item @click="handleDeleteGallery">
          <template v-slot:prepend>
            <v-icon :icon="mdiTrashCan"></v-icon>
          </template>
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

  </span>
</template>

<style scoped>
.actions {
  display: flex;
  flex-direction: row;
}

.action-button {
  cursor: pointer;
  color: #818181;
  background-color: inherit;
  font-size: 0.75em;
  outline: none;
  border: none;
}

.active {
  border: 2px solid red;
}

.menu-icon {
  height: auto;
}
</style>
