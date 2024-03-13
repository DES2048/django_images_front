<script setup lang="ts">
/* __placeholder__ */
import api, { tagsApi } from '@/api';
import type { Tag } from '@/models';
import { useUiStore } from '@/stores/ui'
import { useImagesStore } from '@/stores/images';
import { ref, watchEffect } from 'vue';

// stores
const uiStore = useUiStore()
const imagesStore = useImagesStore()
// data
const tags = ref<Tag[]>([])
const selectedTags = ref<number[]>([])

watchEffect(async () => {
    if (uiStore.openImageTags) {
        tags.value = await tagsApi.list()
        const tagsData = await api.getImageTags(imagesStore.currentGallery, imagesStore.currentImage.name)

        for(let tag of tagsData){
            const idx = tags.value.findIndex((t)=>t.name ===tag.name)
            if(idx>=0) {
                selectedTags.value.push(idx)
            }
        }
    }
})

async function handle() {
    const tagsToUpdate = selectedTags.value.map((t)=>tags.value[t])
    await api.updateImageTags(imagesStore.currentGallery, imagesStore.currentImage.name, tagsToUpdate)
    uiStore.openImageTags = false
}

</script>
<template>
    <v-dialog v-model="uiStore.openImageTags">
        <template v-slot:default="{ isActive }">
            <v-form @submit.prevent="handle">
                <v-card title="Edit tags">
                    <v-chip-group v-model="selectedTags" selected-class="text-primary" column multiple
                    center-active>
                        <v-chip v-for="tag in tags" :key="tag.name" variant="outlined" filter>
                            {{ tag.name }}
                        </v-chip>
                    </v-chip-group>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Close" @click="isActive.value = false" />
                        <v-btn text="Save" @click="handle" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>