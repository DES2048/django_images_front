<script setup lang="ts">
import { type Gallery, GalleryShowMode } from '@/models';
import ToggleButton from './ToggleButton.vue';
import { mdiDotsVertical } from '@mdi/js';
import { useUiStore } from '@/stores/ui';
import api from '@/api';

// props
const props = defineProps<{
    gallery: Gallery
    showMode: GalleryShowMode
}>();

// stores
const uiStore = useUiStore()

// data
// emits
const emit = defineEmits<{
    (e: 'showModeClick', gallerySlug: string, showMode: GalleryShowMode): void
    (e: 'pinUnpinClick', gallerySlug: string, pin: boolean): void
}>()

function handleEditGallery() {
    uiStore.addMode = false
    uiStore.editGalleryId = props.gallery.slug
    uiStore.openAddEditGallery = true
}

async function handleDeleteGallery() {
    if(confirm(`Are you sure delete gallery "${props.gallery.title}"?`)) {
        await api.deleteGallery(props.gallery.slug)
    }
}
</script>

<template>
    <span class="actions">
        <ToggleButton :value="gallery.pinned" :toggled-value="true"
            @on-toggle="emit('pinUnpinClick', gallery.slug, !props.gallery.pinned)">&#128204;</ToggleButton>
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.Marked"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.Marked)">M</ToggleButton>
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.Unmarked"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.Unmarked)"><s>M</s></ToggleButton>
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.All"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.All)">*.*</ToggleButton>
        <v-menu location="right">
            <template v-slot:activator="{ props }">
                <v-icon :icon="mdiDotsVertical" v-bind="props" size="small" class="menu-icon"></v-icon>
            </template>
            <v-list>
                <v-list-item @click="handleEditGallery">
                    <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleDeleteGallery">
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