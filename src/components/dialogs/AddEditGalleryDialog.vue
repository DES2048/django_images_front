<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { useUiStore } from '@/stores/ui';
import api from '@/api';
import { ValidationError, validationErrorHandler, type ToFieldErrors } from '@/api/errors';

type AddGalleryErrors = ToFieldErrors<Omit<typeof data.value, "pinned">>

const uiStore = useUiStore()
let data = ref({
    title: "",
    slug: "",
    pinned: false,
    dir_path: ""
})
const inProgress = ref(false)

let errors = reactive<AddGalleryErrors>({
    title: [],
    slug: [],
    dir_path: []
})


const dialogTitle = computed(() => uiStore.addMode ? "Add gallery" : "Edit gallery")
const submitButtonText = computed(() => uiStore.addMode ? "Add" : "Save")

watchEffect(async () => {
    if (uiStore.openAddEditGallery && !uiStore.addMode) {
        data.value = await api.getGallery(uiStore.editGalleryId)
    }
})

function requiredRule(v: any) {
    return !!v || "Required"
}

const rules = uiStore.addMode ? [requiredRule] : []

function handleErrors(err: unknown) {
    if (err instanceof ValidationError) {
        validationErrorHandler(err, errors)
    }
}
async function handle() {
    try {
        inProgress.value = true
        if (uiStore.addMode) {
            await api.addGallery(data.value)
        } else {
            await api.updateGallery(uiStore.editGalleryId, data.value)   
        }
        uiStore.openAddEditGallery = false
    } catch (err) {
        handleErrors(err)
    } finally {
        inProgress.value = false
    }
}
</script>

<template>
    <v-dialog v-model="uiStore.openAddEditGallery">
        <template v-slot:default="{ isActive }">
            <v-form @submit.prevent="handle">
                <v-card :title="dialogTitle">
                    <v-text-field v-model="data.title" :rules="rules" autofocus :error-messages="errors.title"
                        label="Title">
                    </v-text-field>
                    <v-text-field v-model="data.slug" :rules="rules" :error-messages="errors.slug" label="Id"
                        v-if="uiStore.addMode">
                    </v-text-field>
                    <v-text-field v-model="data.dir_path" :rules="rules" :error-messages="errors.dir_path" label="Path">
                    </v-text-field>
                    <v-checkbox v-model="data.pinned" label="Pinned" />
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Close" @click="isActive.value = false" />
                        <v-btn :text="submitButtonText" @click="handle" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>