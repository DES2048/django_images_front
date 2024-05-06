<script setup lang="ts">
import {GalleryShowMode} from '@/models'
import ToggleButton from './ToggleButton.vue';

// props
defineProps<{
    showMode: GalleryShowMode
}>();

// emits
const emit = defineEmits<{
    (e: 'showModeClick', showMode: GalleryShowMode): void
}>()

</script>
<template>
    <span class="actions">
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.Marked"
            @on-toggle="emit('showModeClick', GalleryShowMode.Marked)">M</ToggleButton>
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.Unmarked"
            @on-toggle="emit('showModeClick', GalleryShowMode.Unmarked)"><s>M</s></ToggleButton>
        <ToggleButton :value="showMode" :toggled-value="GalleryShowMode.All"
            @on-toggle="emit('showModeClick', GalleryShowMode.All)">*.*</ToggleButton>
    </span>
</template>
<style scoped>
.actions {
    display: flex;
    flex-direction: row;
}
</style>