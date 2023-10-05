<script setup lang="ts">
import type { ImageInfo } from '@/models';
import { ref, watch } from 'vue';

    // props: image info, image index, images count, error
    const props = defineProps<{
        imageIndex: number,
        imagesCount: number,
        imageInfo: ImageInfo,
    }>();

    const imageLoading = ref(true);
    const img = ref<HTMLImageElement | null>(null)
    watch(()=>props.imageInfo.name, ()=>{

      imageLoading.value = true
      if(img.value)
        img.value.style.transform = "scale(1.0)";
    })

    
    function onImgLoad() {
      imageLoading.value = false;
    }
</script>

<template>
    <div class="imageContainer2" >
        <div class="image-name">({{(imageIndex+1)}}/{{imagesCount}}) {{ imageInfo.name}}</div>
        <div v-if="imageLoading">Loading image...</div>
        <img v-show="!imageLoading" :src="imageInfo.url" class="responsive2" @load="onImgLoad" ref="img"/>
    </div>
</template>

<style scoped>

/* ??? */
.imageContainer2 {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height:100vh;
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