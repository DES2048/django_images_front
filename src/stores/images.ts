import { type ImageInfo, GalleryShowMode} from '@/models';
import { defineStore } from 'pinia'
import { ref, computed } from 'vue';
import api from '@/api'
import { useSettingsStore } from './settings';

// helpers
// functions for comparsions
function invertComparsion(cmp_result:number) {
  if (cmp_result > 0) {
    return -1;
  } else if (cmp_result < 0) {
    return 1;
  } else {
    return 0;
  }
}

function compareValues(a:number, b:number) {
  if (a == b) {
    return 0;
  } else if (a < b) {
    return -1;
  } else {
    return 1;
  }
}

function shuffle(array:any[]) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export const useImagesStore = defineStore("images", () => {
  // state
  const images = ref<ImageInfo[]>([])
  const currentImageIndex = ref(-1);
  // imported stores
  const settingsStore = useSettingsStore()

  // getters
  const currentImage = computed(()=> {
    return images.value[currentImageIndex.value]
  })

  // actions
  function resetImages() {
    images.value = []
    currentImageIndex.value = -1;
  }

  async function fetchImages(gallery:string, showMode:GalleryShowMode) {
    const imagesData = await api.getImages(gallery, showMode);

    if (imagesData.length == 0) {
      throw new Error("selected gallery did't return any image");  
    }
    
    imagesData.sort((a, b) => invertComparsion(compareValues(a.mod_date, b.mod_date)));
    
    images.value = imagesData;
    currentImageIndex.value = 0; // set to first 
  }

  function firstImage() {
    if (currentImageIndex.value >=0) {
      currentImageIndex.value = 0;
    }
  }

  function lastImage() {
    if (currentImageIndex.value >=0) {
      currentImageIndex.value = images.value.length-1;
    }
  }

  function nextImage() {
    if ((currentImageIndex.value + 1) == images.value.length) {
      return
    }
    currentImageIndex.value++
  }
  
  function prevImage() {
    if (currentImageIndex.value == 0) {
      return
    }
    currentImageIndex.value--
  }
  
  function randomImage() {
    if (images.value.length>0) {
      currentImageIndex.value = Math.floor(Math.random() * images.value.length);
    }
  }
  
  function shuffleImages() {
    if (images.value.length>0) {
      // save current image name
      const imageName = currentImage.value.name
      // shuffling
      images.value = shuffle(images.value.slice())
      // restore right current image index
      currentImageIndex.value = images.value.findIndex((img)=>img.name===imageName)
    }
  }

  async function markCurrentImage() {
      
      if (!settingsStore.settings) {
        return
      }
      const img_info = await api.markImage(
        settingsStore.settings.selectedGallery,
        currentImage.value.name
      );
  
      if (settingsStore.settings.showMode == GalleryShowMode.Unmarked) {
        images.value.splice(currentImageIndex.value, 1);
        randomImage();
      } else {
        images.value[currentImageIndex.value] = img_info;
      }
  }
  
  // TODO throw an error
  async function deleteCurrentImage() {
    if (currentImageIndex.value <0) {
      return
    }

    const response = await api.deleteImage(settingsStore.settings!.selectedGallery, currentImage.value.name)
  
    if (response.ok) {
      images.value.splice(currentImageIndex.value, 1)
      randomImage();
    }
  }

  return {images, currentImageIndex, currentImage, 
    resetImages, fetchImages, firstImage, lastImage, nextImage, prevImage, 
    randomImage, shuffleImages, markCurrentImage, deleteCurrentImage}
})
