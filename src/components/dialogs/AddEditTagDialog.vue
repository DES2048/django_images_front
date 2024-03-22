<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import type { AddTagPayload } from '@/api/payloads';
import { reactive, ref } from 'vue';
import { resetFieldErrors, validationErrorHandler, type ToFieldErrors, ValidationError } from '@/api/errors';
import { tagsApi } from '@/api';
import useAddEdit from '@/composables/useAddEdit';
import { storeToRefs } from 'pinia';

// stores
const uiStore = useUiStore()
const {addMode} = storeToRefs(uiStore)
// data
const addTagPayload = ref<AddTagPayload>({
    name: ""
})
const addTagErrors = reactive<ToFieldErrors<AddTagPayload>>({
    name: []
})

const {title, submitButtonText} = useAddEdit({
    title: {
        add: "Add tag",
        edit: "Edit tag"
    },
    isAddMode: addMode
})

async function handleAddTag() {
    resetFieldErrors(addTagErrors)
    const tagNameClear = addTagPayload.value.name.trim()
    if (!tagNameClear) {
        addTagErrors.name.push("required")
        return
    }

    try {
        await tagsApi.add({
        name: tagNameClear
    })
    uiStore.openAddEditTag(false)
    } catch(err) {
        if( err instanceof ValidationError) {
            validationErrorHandler(err, addTagErrors)
        }
    }
    
}
</script>
<template>
    <v-dialog v-model="uiStore._openAddEditTag">
        <template v-slot:default="{ isActive }">
            <v-form @submit.prevent="handleAddTag">
                <v-card :title="title">
                    <v-text-field v-model="addTagPayload.name" :rules="[(v) => !!v || 'required']" autofocus
                        :error-messages="addTagErrors.name">
                    </v-text-field>
                    <v-card-actions>
                        <v-spacer />

                        <v-btn text="Close" @click="isActive.value = false" />
                        <v-btn :text="submitButtonText" @click="handleAddTag" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>