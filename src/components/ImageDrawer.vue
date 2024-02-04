<script setup lang="ts">
import type { ImageInfo } from '@/models';
import { ref, watch } from 'vue';
import { mdiPencil } from '@mdi/js'
import { useImagesStore } from '@/stores/images';

// props: image info, image index, images count, error
const props = defineProps<{
  imageIndex: number,
  imagesCount: number,
  imageInfo: ImageInfo,
}>();

// stores
const imagesStore = useImagesStore()

// data
const imageLoading = ref(true);
const imageRenameDialogVisible = ref(false)
const newImageName = ref("")

const img = ref<HTMLImageElement | null>(null)
watch(() => props.imageInfo.name, () => {

  imageLoading.value = true
  if (img.value)
    img.value.style.transform = "scale(1.0)";
})


function onImgLoad() {
  imageLoading.value = false;
}

function showRenameImageDialog() {
  newImageName.value = props.imageInfo.name
  imageRenameDialogVisible.value = true;
  
}

async function handleNewImageName() {
  imageRenameDialogVisible.value = false;

  if (newImageName.value === props.imageInfo.name) {
    return
  }
  if (!newImageName.value.trim()) {
    return
  }

  await imagesStore.renameCurrentImage(newImageName.value);  
}
</script>

<template>
  <div class="imageContainer2">
    <v-dialog v-model="imageRenameDialogVisible">
      <template v-slot:default="{ isActive }">
        <v-card title="Input new name">

          <v-text-field v-model="newImageName" :rules="[(v)=>!!v || 'required']"></v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn text="Close" @click="isActive.value = false"></v-btn>
            <v-btn text="Save" @click="handleNewImageName"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <div class="image-name">
      <span>({{ (imageIndex + 1) }}/{{ imagesCount }}) {{ imageInfo.name }}</span>
      <v-icon :icon="mdiPencil" color="rgb(240, 248, 255)" @click="showRenameImageDialog"></v-icon>
    </div>
    <div v-if="imageLoading">Loading image...</div>
    <img v-show="!imageLoading" :src="imageInfo.url" class="responsive2" @load="onImgLoad" ref="img"
      @error="imageLoading = false" />
  </div>
</template>

<style scoped>
/* ??? */
.imageContainer2 {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100vh;
}

.image-name {
  text-align: center;
}

.responsive2 {
  flex-grow: 1;
  max-width: 100%;
  max-height: calc(100vh - 18px);
  object-fit: contain;
}

.responsive {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 95%;
}
</style>