import type { ImageInfo, PickerSettings } from '@/models';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useImagesStore = defineStore("images", () => {
  // state
  let settings: PickerSettings|undefined;
  const images = ref<ImageInfo[]>([])
  const error = ref("");
  const currentImageIndex = ref(-1);
  const sidenavOpen = ref(false);

  return {settings, images, error, currentImageIndex, sidenavOpen}
})
