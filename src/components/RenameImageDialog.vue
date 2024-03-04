<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { useImagesStore } from '@/stores/images';

import { ref, watch } from 'vue';
import { ValidationError } from '@/api/errors';

const uiStore = useUiStore()
const imagesStore = useImagesStore()

const newImageName = ref("");
const nameErrors = ref<string[]>()

watch(() => uiStore.openRenameImage, (value) => {
    if (value) {
        newImageName.value = imagesStore.currentImage.name
    }
}, { immediate: true })

function handleFocus(event: FocusEvent) {
    const input = (event.target as HTMLInputElement);
    const text = input.value
    // get extension pos
    let extStart = text.lastIndexOf(".");

    if (text[extStart - 1] === "_") {
        extStart--;
    }

    if (extStart > 0) {
        input.setSelectionRange(0, extStart);
    }
}
async function handleRename() {

    if (newImageName.value === imagesStore.currentImage.name) {
        return;
    }
    if (!newImageName.value.trim()) {
        return;
    }

    try {
        await imagesStore.renameCurrentImage(newImageName.value);
        uiStore.openRenameImage = false
    } catch (error) {
        if (error instanceof ValidationError) {
            nameErrors.value = error.fieldErrors["new_name"]
        } else {
            //throw error
        }
    }

}
</script>

<template>
    <v-dialog v-model="uiStore.openRenameImage">
        <template v-slot:default="{ isActive }">
            <v-form @submit.prevent="handleRename">
                <v-card title="Input new name">
                    <v-text-field v-model="newImageName" :rules="[(v) => !!v || 'required']" autofocus
                        @focus="handleFocus" :error-messages="nameErrors">
                    </v-text-field>
                    <v-card-actions>
                        <v-spacer />

                        <v-btn text="Close" @click="isActive.value = false" />
                        <v-btn text="Save" @click="handleRename" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>