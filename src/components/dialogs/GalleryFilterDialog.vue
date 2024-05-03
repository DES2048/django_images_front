<script setup lang="ts">
/* __placeholder__ */
import { tagsApi } from '@/api';
import type { TagWithCount } from '@/models';
import { useUiStore } from '@/stores/ui'
import { useImagesStore } from '@/stores/images';
import { ref, watchEffect } from 'vue';
import { getGalleriesSettings, saveGallerySettings } from '@/storage';

// stores
const uiStore = useUiStore()
const imagesStore = useImagesStore()
// data
const tags = ref<TagWithCount[]>([])
const selectedTags = ref<number[]>([])

watchEffect(async () => {
    if (uiStore.openGalleryFilter) {
        let tagsData = await tagsApi.list(uiStore.editGalleryId) as TagWithCount[]
        tagsData = tagsData.filter((t:TagWithCount)=>t.images_count >0)
        tags.value = tagsData

        // get selected tags id from settings
        const galleriesSettings = getGalleriesSettings()
        const thisGallerySettings = galleriesSettings[uiStore.editGalleryId]
        if (thisGallerySettings?.filter?.tags.length)

        for(let tagId of thisGallerySettings.filter.tags){
            const idx = tags.value.findIndex((t)=>t.id ===tagId)
            if(idx>=0) {
                selectedTags.value.push(idx)
            }
        }
    }
})

function resetTags() {
    selectedTags.value = []
}

async function handle() {
    const tagsToUpdate = selectedTags.value.map((t)=>tags.value[t].id)
    saveGallerySettings(uiStore.editGalleryId, {filter: {
        tags: tagsToUpdate
    }})
    await imagesStore.fetchImages()
    uiStore.closeGalleryFilter()
}

</script>
<template>
    <v-dialog v-model="uiStore.openGalleryFilter">
        <template v-slot:default>
            <v-form @submit.prevent="handle">
                <v-card title="Gallery filter">
                    <v-chip-group v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                            {{ tag.images_count }} {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Reset" @click="resetTags" />
                        <v-btn text="Close" @click="uiStore.closeGalleryFilter" />
                        <v-btn text="Save" @click="handle" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>