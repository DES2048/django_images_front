<script setup lang="ts">
import { useImagesStore } from '@/stores/images';
import { useDialog } from '@/composables/Dialog';
import { onBeforeMount, ref } from 'vue';
import { ValidationError } from '@/api/errors';


const props = defineProps<{
  guid: string,
  imageName?: string
}>()

const imagesStore = useImagesStore()

const newImageName = ref("");
const nameErrors = ref<string[]>()
const inProcess = ref(false)
const { isOpened,close } = useDialog(props.guid)

onBeforeMount(()=> {
  newImageName.value = imagesStore.currentImage.name
})

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

    if (newImageName.value === props.imageName) {
        close()
    }
    if (!newImageName.value.trim()) {
        return;
    }

    try {
        inProcess.value = true
        await imagesStore.renameCurrentImage(newImageName.value);
      close()
    } catch (error) {
        if (error instanceof ValidationError) {
            nameErrors.value = error.fieldErrors["new_name"]
        } else {
            //throw error
        }
    } finally {
        inProcess.value = false
    }

}
</script>

<template>
    <v-dialog v-model="isOpened">
            <v-form @submit.prevent="handleRename">
                <v-card title="Input new name">
                    <v-text-field v-model="newImageName" :rules="[(v) => !!v || 'required']" autofocus
                        @focus="handleFocus" :error-messages="nameErrors" :loading="inProcess">
                    </v-text-field>
                    <v-card-actions>
                        <v-spacer />

                        <v-btn text="Close" @click="close" />
                        <v-btn text="Save" @click="handleRename" />
                    </v-card-actions>
                </v-card>
            </v-form>
    </v-dialog>
</template>
