<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useImagesStore } from '@/stores/images';
import { useSettingsStore } from '@/stores/settings';
import type { Gallery } from '@/models';
import api from '@/api';
import { ValidationError } from '@/api/errors';

// stores
const uiStore = useUiStore()
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()

// data
const selected = ref<string[]>([])
const galleries = ref<Gallery[]>([])
const errors = ref<string[]>([])

// watchers
watch(() => uiStore.openCopyMoveToGallery, async (open: boolean) => {
    if (open) {
        const gallsData = await api.getGalleries()
        const idx = gallsData.findIndex((g) => g.slug === imagesStore.currentGallery)
        gallsData.splice(idx, 1)

        galleries.value = gallsData

    } else {
        galleries.value = []
        selected.value = []
        uiStore.moveToGalleryMode = false
    }
}, { immediate: true })

async function handle() {
    errors.value = []

    if (!selected.value[0]) {
        errors.value.push("Please, select gallery")
        return
    }

    try {
        await api.copyMoveImage(
            imagesStore.currentGallery,
            selected.value[0],
            imagesStore.currentImage.name,
            uiStore.moveToGalleryMode
        )
        if (!settingsStore.settings.favoriteImagesMode && uiStore.moveToGalleryMode) {
            imagesStore.images.splice(imagesStore.currentImageIndex, 1)
        }
        uiStore.openCopyMoveToGallery = false
    } catch (err) {
        if (err instanceof ValidationError) {
            if (err.commonErrors) {
                errors.value = err.commonErrors
            }
            if (err.fieldErrors) {
                for (let [field_name, fieldErrors] of Object.entries(err.fieldErrors))
                    errors.value.push(`${field_name}: ${fieldErrors[0]}`)
            }
        }
    }
}
</script>

<template>
    <v-dialog v-model="uiStore.openCopyMoveToGallery" scrollable>
        <template v-slot:default="{ isActive }">
            <v-card title="Copy/Move To:">
                <v-card-subtitle>
                    <v-checkbox label="Move" v-model="uiStore.moveToGalleryMode" density="compact" :error-messages="errors"/>
                </v-card-subtitle>
                <v-divider />
                <v-card-text>
                    <v-list :items="galleries" item-value="slug" item-props v-model:selected="selected" />
                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text="Close" @click="isActive.value = false" />
                    <v-btn text="Ok" @click="handle" />
                </v-card-actions>
            </v-card>
        </template>

    </v-dialog>
</template>