<script setup lang="ts">
import type { ImageInfo } from "@/models";
import { ref, watch } from "vue";
import { mdiPencil } from "@mdi/js";
import { useImagesStore } from "@/stores/images";
import { useUiStore } from "@/stores/ui";

// props: image info, image index, images count, error
const props = defineProps<{
  imageIndex: number;
  imagesCount: number;
  imageInfo: ImageInfo;
}>();

// stores
const imagesStore = useImagesStore();
const uiStore = useUiStore()

// data
const imageLoading = ref(true);
const showGoToIndex = ref(false);
const newImageIndex = ref(1);

const img = ref<HTMLImageElement | null>(null);
watch(
  () => props.imageInfo.name,
  () => {
    imageLoading.value = true;
    if (img.value) img.value.style.transform = "scale(1.0)";
  }
);

watch(showGoToIndex, (v) => {
  if (v) newImageIndex.value = props.imageIndex + 1;
});
function onImgLoad() {
  imageLoading.value = false;
}

function requiredRule(v: any): boolean | string {
  return !!v || "Required";
}

function newImageIndexRule(v: number): boolean | string {
  if (v > 0 && v <= imagesStore.images.length) {
    return true;
  }
  return `Index should be between 1 and ${imagesStore.images.length}`;
}

function handleGoToIndex() {
  if (
    newImageIndex.value > 0 &&
    newImageIndex.value <= imagesStore.images.length
  ) {
    imagesStore.goToIndex(newImageIndex.value - 1);
    showGoToIndex.value = false;
  }
}
</script>

<template>
  <div class="imageContainer2">
    <v-dialog v-model="showGoToIndex">
      <template v-slot:default="{ isActive }">
        <v-form @submit.prevent="handleGoToIndex">
          <v-card title="Image index:">
            <v-text-field type="number" v-model="newImageIndex" :rules="[requiredRule, newImageIndexRule]"
              autofocus></v-text-field>
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" @click="isActive.value = false"></v-btn>
              <v-btn text="OK" @click="handleGoToIndex"></v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </template>
    </v-dialog>
    <div class="image-name">
      <span @click="showGoToIndex = true">
        ({{ imageIndex + 1 }}/{{ imagesCount }}) {{ imageInfo.name }}
      </span>
      <v-icon :icon="mdiPencil" color="rgb(240, 248, 255)" @click="uiStore.openRenameImage=true"></v-icon>
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
