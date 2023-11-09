import { type ImageInfo, GalleryShowMode} from '@/models';
import { defineStore } from 'pinia'
import { ref, computed } from 'vue';
import api from '@/api'
import { useSettingsStore } from './settings';

// helpers
// functions for comparsions

export function compareValues<T extends number|string>(a:T, b:T, invert?:boolean):number {
  let cmp_result = 0;
  if (a == b) {
    cmp_result = 0;
  } else if (a < b) {
    cmp_result = -1;
  } else {
    cmp_result = 1;
  }
  // if need inversion return inverted value, ottherwise return cmp_result itself
  return (cmp_result && invert) ? -cmp_result: cmp_result;
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
  const randomMode = ref(false)
  const imagesLoaded = ref(false)

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
    randomMode.value = false
  }

  async function fetchImages(gallery:string, showMode:GalleryShowMode) {
    const imagesData = await api.getImages(gallery, showMode);

    if (imagesData.length == 0) {
      throw new Error("selected gallery did't return any image");  
    }
    
    //imagesData.sort((a, b) => invertComparsion(compareValues(a.mod_date, b.mod_date)));
    imagesData.sort((a, b) => compareValues<number>(a.mod_date, b.mod_date, true));
    images.value = imagesData;
    if (randomMode.value) {
      randomImage();
    } else {
      currentImageIndex.value = 0; // set to first 
    }
    imagesLoaded.value = true;
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
    if (randomMode.value) {
      randomImage()
      return
    }
    if ((currentImageIndex.value + 1) == images.value.length) {
      return
    }
    currentImageIndex.value++
  }
  
  function prevImage() {
    if (randomMode.value) {
      randomImage()
      return
    }
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
  function shuffleImages2() {
    if (images.value.length>0) {
      // move current image to first pos
      [images.value[0], images.value[currentImageIndex.value]] = [
        images.value[currentImageIndex.value], images.value[0]];
     
      // shuffle rest of array
      images.value = [images.value[0], ...shuffle(images.value.slice(1))]
      currentImageIndex.value = 0;
    }
  }

  async function markCurrentImage() {
      
      if (!settingsStore.settings) {
        return
      }
      if (!currentImage.value)
        return

      const img_info = await api.markImage(
        settingsStore.settings.selectedGallery,
        currentImage.value.name
      );
  
      if (settingsStore.settings.showMode == GalleryShowMode.Unmarked) {
        images.value.splice(currentImageIndex.value, 1);
        if (randomMode.value) {
          randomImage();
        } else {
          // move to next if possible
          if (currentImageIndex.value === images.value.length) {
            prevImage()
          }
        }
        
      } else {
        images.value[currentImageIndex.value] = img_info;
      }
  }
  async function unmarkCurrentImage() {
      
    if (!settingsStore.settings) {
      return
    }
    if (!currentImage.value)
        return
    
    const img_info = await api.unmarkImage(
      settingsStore.settings.selectedGallery,
      currentImage.value.name
    );

    if (settingsStore.settings.showMode == GalleryShowMode.Marked) {
      images.value.splice(currentImageIndex.value, 1);
      if (randomMode.value) {
        randomImage();
      } else {
        // move to next if possible
        if (currentImageIndex.value === images.value.length) {
          prevImage()
        }
      }
      
    } else {
      images.value[currentImageIndex.value] = img_info;
    }
}
  
  // TODO throw an error
  async function deleteCurrentImage() {
    if (currentImageIndex.value <0) {
      return
    }

    // FIXME check response
    await api.deleteImage(settingsStore.settings!.selectedGallery, currentImage.value.name)
  
    images.value.splice(currentImageIndex.value, 1) 
  }

  return {images, currentImageIndex, imagesLoaded, currentImage, randomMode,
    resetImages, fetchImages, firstImage, lastImage, nextImage, prevImage, 
    randomImage, shuffleImages:shuffleImages2, markCurrentImage, unmarkCurrentImage, deleteCurrentImage}
})
