<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useDialog } from '@/composables/Dialog';
import api from '@/api';
import { ValidationError, validationErrorHandler, type ToFieldErrors } from '@/api/errors';

type AddGalleryErrors = ToFieldErrors<Omit<typeof data.value, "pinned">>

const props = defineProps<{
  guid: string,
  galleryId?: string,
  addMode: boolean,
}>()

const { isOpened,close } = useDialog(props.guid)

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


const dialogTitle = computed(() => props.addMode ? "Add gallery" : "Edit gallery")
const submitButtonText = computed(() => props.addMode ? "Add" : "Save")

onBeforeMount(async () => {
    if (!props.addMode) {
        data.value = await api.getGallery(props.galleryId!)
    }
})

function requiredRule(v: any) {
    return !!v || "Required"
}

const rules = props.addMode ? [requiredRule] : []

function handleErrors(err: unknown) {
    if (err instanceof ValidationError) {
        validationErrorHandler(err, errors)
    }
}
async function handle() {
    try {
        inProgress.value = true
        if (props.addMode) {
            await api.addGallery(data.value)
        } else {
            await api.updateGallery(props.galleryId!, data.value)   
        }
        close()
    } catch (err) {
        handleErrors(err)
    } finally {
        inProgress.value = false
    }
}
</script>

<template>
    <v-dialog v-model="isOpened">
        <template v-slot:default>
            <v-form @submit.prevent="handle">
                <v-card :title="dialogTitle">
                    <v-text-field v-model="data.title" :rules="rules" autofocus :error-messages="errors.title"
                        label="Title">
                    </v-text-field>
                    <v-text-field v-model="data.slug" :rules="rules" :error-messages="errors.slug" label="Id"
                        v-if="props.addMode">
                    </v-text-field>
                    <v-text-field v-model="data.dir_path" :rules="rules" :error-messages="errors.dir_path" label="Path">
                    </v-text-field>
                    <v-checkbox v-model="data.pinned" label="Pinned" />
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text="Close" @click="close" />
                        <v-btn :text="submitButtonText" @click="handle" />
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>
