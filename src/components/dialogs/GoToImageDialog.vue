<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { useImagesStore } from '@/stores/images';
import { ref, watch } from 'vue';
import type { FavImageInfo, ImageInfo } from '@/models';


// stores
const uiStore = useUiStore()
const imagesStore = useImagesStore()

// data
const isGoToIndex = ref(true)
const newImageIndex = ref(1)
const imageName = ref("")
const imagesList = ref<ImageInfo[] | FavImageInfo[]>([])
const imageNameSearch = ref("")

watch(imageNameSearch, (val) => {
    if (val) {
        imagesList.value = imagesStore.images.filter((e) => e.name.startsWith(val))
    }
})


function requiredRule(v: any): boolean | string {
    return !!v || "Required";
}

function newImageIndexRule(v: number): boolean | string {
    if (v > 0 && v <= imagesStore.images.length) {
        return true;
    }
    return `Index should be between 1 and ${imagesStore.images.length}`;
}

function handle() {
    if (isGoToIndex.value) {
        if (
            newImageIndex.value > 0 &&
            newImageIndex.value <= imagesStore.images.length
        ) {
            imagesStore.goToIndex(newImageIndex.value - 1);
            uiStore.openGoToImage = false;
        }
    } else {
        const imgIndex = imagesStore.images.findIndex(({name})=>name === imageName.value)
        if (imgIndex>=0) {
            imagesStore.goToIndex(imgIndex)
        }
        uiStore.openGoToImage = false
    }

}
</script>

<template>
    <v-dialog v-model="uiStore.openGoToImage">
        <template v-slot:default="{ isActive }">
            <v-form @submit.prevent="handle">
                <v-card>
                    <template v-slot:title>
                        <v-switch v-model="isGoToIndex" :label="isGoToIndex ? 'Go to index' : 'Go to image'" />
                    </template>
                    <v-text-field type="number" v-if="isGoToIndex" v-model="newImageIndex"
                        :rules="[requiredRule, newImageIndexRule]" autofocus></v-text-field>
                    <v-autocomplete v-else v-model="imageName" v-model:search="imageNameSearch" :items="imagesList"
                        item-title="name" item-value="name" label="image name" density="compact"
                        :menu-props="{ 'location': 'bottom' }" hide-no-data />
                    <v-card-actions>
                        <v-spacer></v-spacer>

                        <v-btn text="Close" @click="isActive.value = false"></v-btn>
                        <v-btn text="OK" @click="handle"></v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>
    </v-dialog>
</template>