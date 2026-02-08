<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import type { AddTagPayload } from '@/api/payloads';
import { reactive, ref } from 'vue';
import { resetFieldErrors, validationErrorHandler, type ToFieldErrors, ValidationError } from '@/api/errors';
import { tagsApi } from '@/api';
import useAddEdit from '@/composables/useAddEdit';
import { useDialog } from '@/composables/Dialog';

const props = defineProps<{
  guid:string,
  addMode: boolean,
}>()

// stores
const {isOpened, close } = useDialog(props.guid)

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
    isAddMode: ref(props.addMode)
})

async function handleAddTag() {
    resetFieldErrors(addTagErrors)
    const name = addTagPayload.value.name
    if (!name) {
        addTagErrors.name.push("required")
        return
    }

    try {
        await tagsApi.add({
        name,
    })
    close()
    } catch(err) {
        if( err instanceof ValidationError) {
            validationErrorHandler(err, addTagErrors)
        }
    }
    
}
</script>
<template>
    <v-dialog v-model="isOpened">
        <template v-slot:default>
            <v-form @submit.prevent="handleAddTag">
                <v-card :title="title">
                    <v-text-field v-model.trim="addTagPayload.name" :rules="[(v:string) => !!v || 'required']" autofocus
                        :error-messages="addTagErrors.name">
                    </v-text-field>
                    <v-card-actions>
                        <v-spacer />

                        <v-btn text="Close" @click="close" />
                        <v-btn :text="submitButtonText" @click="handleAddTag" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>
