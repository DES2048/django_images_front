<script setup lang="ts">
import { type Gallery, GalleryShowMode } from '@/models';
import ToggleButton from './ToggleButton.vue';

// props
const props = defineProps<{
    gallery: Gallery
    showMode: GalleryShowMode
}>();

// emits
const emit = defineEmits<{
    (e: 'showModeClick', gallerySlug:string, showMode:GalleryShowMode):void
    (e: 'pinUnpinClick', gallerySlug:string, pin:boolean):void
}>()

</script>

<template>
    <span class="actions">
        <ToggleButton :value="gallery.pinned" :toggled-value="true"
            @on-toggle="emit('pinUnpinClick', gallery.slug, !props.gallery.pinned)">&#128204;</ToggleButton>
        <ToggleButton  :value="showMode" :toggled-value="GalleryShowMode.Marked"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.Marked)">M</ToggleButton>
        <ToggleButton  :value="showMode" :toggled-value="GalleryShowMode.Unmarked"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.Unmarked)"><s>M</s></ToggleButton>
        <ToggleButton  :value="showMode" :toggled-value="GalleryShowMode.All"
            @on-toggle="emit('showModeClick', gallery.slug, GalleryShowMode.All)">*.*</ToggleButton>
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

</style>