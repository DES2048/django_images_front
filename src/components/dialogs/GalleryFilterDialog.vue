<script setup lang="ts">
/* __placeholder__ */
import { tagsApi } from '@/api';
import { GalleryShowMode, type TagWithCount } from '@/models';
import { useUiStore } from '@/stores/ui'
import { useImagesStore } from '@/stores/images';
import { ref, watchEffect } from 'vue';
import { getGalleriesSettings, saveGallerySettings } from '@/storage';
import { useSettingsStore } from '@/stores/settings';

// stores
const uiStore = useUiStore()
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()

// data
const tags = ref<TagWithCount[]>([])
const selectedTags = ref<number[]>([])

watchEffect(async () => {
    if (uiStore.openGalleryFilter) {
        // get gallery show_mode for tags image count stat
        const show_mode = settingsStore.settings.selectedGallery == uiStore.editGalleryId ?
            settingsStore.settings.showMode : GalleryShowMode.All

        let tagsData = await tagsApi.list(uiStore.editGalleryId, show_mode) as TagWithCount[]
        
        // get selected tags id from settings
        const galleriesSettings = getGalleriesSettings()
        const selTags = galleriesSettings[uiStore.editGalleryId]?.filter?.tags

        tagsData = tagsData.filter((t:TagWithCount)=>t.images_count >0 || (selTags && selTags.includes(t.id)))
        
        if (selTags) {

            // fill selected tags
            for(let tagId of selTags){
                const idx = tagsData.findIndex((t)=>t.id ===tagId)
                if(idx>=0) {
                    selectedTags.value.push(idx)
                }
            }
        }

        tags.value = tagsData

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
    imagesStore.imagesFilter.selectedTags = tagsToUpdate
    //await imagesStore.fetchImages()
    uiStore.closeGalleryFilter()
}

</script>
<template>
    <v-dialog v-model="uiStore.openGalleryFilter">
        <template v-slot:default>
            <v-form @submit.prevent="handle">
                <v-card title="Gallery filter">
                    <v-chip-group v-if="tags.length>0" v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.id" variant="outlined" filter>
                            {{ tag.images_count }} {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                    <div v-else>
                        <h4>No tags for this gallery filter</h4>
                    </div>
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