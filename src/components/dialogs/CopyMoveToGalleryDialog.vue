<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useImagesStore } from '@/stores/images';
import { useSettingsStore } from '@/stores/settings';
import { useDialog } from '@/composables/Dialog';
import type { Gallery } from '@/models';
import api from '@/api';
import { ValidationError } from '@/api/errors';

const props = defineProps<{
  guid:string,
  galleryId: string,
  imageName: string,
  move: boolean,
}>()

// stores
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()
const {isOpened, close } = useDialog(props.guid)

// data
const selected = ref<string[]>([])
const galleries = ref<Gallery[]>([])
const errors = ref<string[]>([])
const moveD = ref(false)

// watchers
onBeforeMount(async () => {
  
    const gallsData = await api.getGalleries()
    const idx = gallsData.findIndex((g) => g.slug === imagesStore.currentGallery)
    gallsData.splice(idx, 1)

    galleries.value = gallsData
    moveD.value = props.move

})

async function handle() {
    errors.value = []

    if (!selected.value[0]) {
        errors.value.push("Please, select gallery")
        return
    }

    try {
        await api.copyMoveImage(
            props.galleryId,
            selected.value[0],
            props.imageName,
            props.move,
        )
        if (!settingsStore.settings.favoriteImagesMode && props.move) {
            imagesStore.images.splice(imagesStore.currentImageIndex, 1)
        }
        close()
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
    <v-dialog v-model="isOpened" scrollable>
        <template v-slot:default>
            <v-card title="Copy/Move To:">
                <v-card-subtitle>
                    <v-checkbox label="Move" v-model="moveD" density="compact" :error-messages="errors"/>
                </v-card-subtitle>
                <v-divider />
                <v-card-text>
                    <v-list :items="galleries" item-value="slug" item-props v-model:selected="selected" />
                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text="Close" @click="close" />
                    <v-btn text="Ok" @click="handle" />
                </v-card-actions>
            </v-card>
        </template>

    </v-dialog>
</template>
