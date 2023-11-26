import { type ImageInfo, GalleryShowMode, type FavImageInfo} from '@/models';
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue';
import api from '@/api'
import { useSettingsStore } from './settings';
import { compareValues, shuffleArray } from '@/utils'

export const useImagesStore = defineStore("images", () => {

  // state
  const images = ref<ImageInfo[] | FavImageInfo[]>([])
  const currentImageIndex = ref(-1);
  const randomMode = ref(false)
  const imagesLoaded = ref(false)

  // imported stores
  const settingsStore = useSettingsStore()
  const { settings } = storeToRefs(settingsStore)
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
  
  async function fetchImages() {
    const set = settings.value;
    const imagesData = set.favoriteImagesMode ? 
      await api.getFavImages() : 
      await api.getImages(set.selectedGallery, set.showMode);

    // TODO drop error
    if (imagesData.length == 0) {
      throw new Error("selected gallery did't return any image");  
    }
    
    if (set.favoriteImagesMode) {
      (imagesData as FavImageInfo[]).sort((a, b) => compareValues<number>(a["add_to_fav_date"], b["add_to_fav_date"], true));
    } else {
      (imagesData as ImageInfo[]).sort((a, b) => compareValues<number>(a["mod_date"], b["mod_date"], true));
    }
    
    images.value = imagesData
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
      images.value = shuffleArray(images.value.slice())
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
      images.value = [images.value[0], ...shuffleArray(images.value.slice(1))]
      currentImageIndex.value = 0;
    }
  }

  async function markCurrentImage() {
      if (settingsStore.settings.favoriteImagesMode) {
        return
      }
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
    if (!settingsStore.settings.favoriteImagesMode) {
      return
    }  
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
    if (settingsStore.settings.favoriteImagesMode) {
      const img = currentImage.value as FavImageInfo
      await api.deleteImageFromFav(img.gallery, img.name)
    } else {
      await api.deleteImage(settingsStore.settings!.selectedGallery, currentImage.value.name)
    }
    
    images.value.splice(currentImageIndex.value, 1) 
  }

  // fav
  async function addCurrentImageToFav() {
    if (settingsStore.settings && settingsStore.settings.selectedGallery && currentImage.value) {
      await api.addImageToFav(settingsStore.settings.selectedGallery, currentImage.value.name);
      currentImage.value.is_fav = true
    }
  }

  async function deleteCurrentImageFromFav() {
    if (settingsStore.settings && settingsStore.settings.selectedGallery && currentImage.value) {
      await api.deleteImageFromFav(settingsStore.settings.selectedGallery, currentImage.value.name);
      currentImage.value.is_fav = false
    }
  } 

  return {images, currentImageIndex, imagesLoaded, currentImage, randomMode,
    resetImages, fetchImages, firstImage, lastImage, nextImage, prevImage, 
    randomImage, shuffleImages:shuffleImages2, markCurrentImage, unmarkCurrentImage, deleteCurrentImage,
    addCurrentImageToFav, deleteCurrentImageFromFav }
})
