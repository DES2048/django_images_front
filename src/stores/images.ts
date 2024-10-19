import { type ImageInfo, GalleryShowMode, type FavImageInfo } from "@/models";
import { defineStore, storeToRefs } from "pinia";
import { ref, computed } from "vue";
import api from "@/api";
import { useSettingsStore } from "./settings";
import { compareValues, shuffleArray } from "@/utils";

export interface ImagesFilter {
  selectedTags?: number[]
}

export const useImagesStore = defineStore("images", () => {
  // state
  const images = ref<ImageInfo[] | FavImageInfo[]>([]);
  const currentImageIndex = ref(-1);
  const randomMode = ref(false);
  const imagesLoaded = ref(false);
  const imagesFilter = ref<ImagesFilter>({})

  // imported stores
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  
  // getters
  const currentImage = computed(() => {
    return images.value[currentImageIndex.value];
  });

  const currentGallery = computed(()=>{
    return currentImage.value.gallery || settings.value.selectedGallery
    return settings.value.favoriteImagesMode ? (currentImage.value as FavImageInfo).gallery
      : settings.value.selectedGallery
  })

  // actions
  function resetImages() {
    images.value = [];
    currentImageIndex.value = -1;
    randomMode.value = false;
    imagesLoaded.value = false;
  }

  async function fetchImages() {
    
    resetImages()

    const set = settings.value;
    let imagesData
    if(set.favoriteImagesMode) {
      imagesData =  await api.getFavImages({showMode: set.showMode})
    } else if(set.selectedGallery) {
      imagesData =  await api.getImages(set.selectedGallery, set.showMode, {
        tags: imagesFilter.value.selectedTags || settings.value.selectedTags 
          || undefined
      });
    } else {
      imagesData = await api.filterImages({
        showMode: settings.value.showMode,
        tags: settings.value.selectedTags
      })
    }

    if (settings.value.shufflePicsWhenLoaded) {
      imagesData = shuffleArray(imagesData)
    } else {
      // sorting
      if (set.favoriteImagesMode) {
        (imagesData as FavImageInfo[]).sort((a, b) =>
          compareValues<number>(a["add_to_fav_date"], b["add_to_fav_date"], true)
        );
      } else {
        (imagesData as ImageInfo[]).sort((a, b) =>
          compareValues<number>(a.mod_time, b.mod_time, true)
        );
        //(imagesData as ImageInfo[]).sort((a, b) => b.mod_time - a.mod_time);
      }
    }

    images.value = imagesData;
    if (randomMode.value) {
      randomImage();
    } else {
      currentImageIndex.value = 0; // set to first
    }
    imagesLoaded.value = true;
  }

  function goToIndex(index: number) {
    if (index < 0 || index >= images.value.length)
    {
      return
    }
    currentImageIndex.value = index
  }

  function firstImage() {
    if (currentImageIndex.value >= 0) {
      currentImageIndex.value = 0;
    }
  }

  function lastImage() {
    if (currentImageIndex.value >= 0) {
      currentImageIndex.value = images.value.length - 1;
    }
  }

  function nextImage() {
    if (randomMode.value) {
      randomImage();
      return;
    }
    if (currentImageIndex.value + 1 == images.value.length) {
      return;
    }
    currentImageIndex.value++;
  }

  function prevImage() {
    if (randomMode.value) {
      randomImage();
      return;
    }
    if (currentImageIndex.value == 0) {
      return;
    }
    currentImageIndex.value--;
  }

  function randomImage() {
    if (images.value.length > 0) {
      currentImageIndex.value = Math.floor(Math.random() * images.value.length);
    }
  }

  function shuffleImages2() {
    if (images.value.length > 0) {
      // move current image to first pos
      [images.value[0], images.value[currentImageIndex.value]] = [
        images.value[currentImageIndex.value],
        images.value[0],
      ];

      // shuffle rest of array
      images.value = [images.value[0], ...shuffleArray(images.value.slice(1))];
      currentImageIndex.value = 0;
    }
  }

  async function markUnmarkCurrentImage(mark: boolean) {
    if (!settings.value) {
      return;
    }
    if (!currentImage.value) return;

    const selGallery = settings.value.favoriteImagesMode
      ? (currentImage.value as FavImageInfo).gallery
      : settings.value.selectedGallery;

    const apiCall = mark ? api.markImage : api.unmarkImage;

    const img_info = await apiCall.call(
      api,
      selGallery,
      currentImage.value.name
    );

    const filterShowMode = mark
      ? GalleryShowMode.Unmarked
      : GalleryShowMode.Marked;

    if (
      settings.value.showMode == filterShowMode &&
      !settings.value.favoriteImagesMode
    ) {
      images.value.splice(currentImageIndex.value, 1);
      if (randomMode.value) {
        randomImage();
      } else {
        // move to next if possible
        if (currentImageIndex.value === images.value.length) {
          prevImage();
        }
      }
    } else {
      images.value[currentImageIndex.value] = {
        ...images.value[currentImageIndex.value],
        ...img_info,
      };
    }
  }

  async function markCurrentImage() {
    markUnmarkCurrentImage(true);
  }
  async function unmarkCurrentImage() {
    markUnmarkCurrentImage(false);
  }

  async function renameCurrentImage(newName: string) {
    if (currentImageIndex.value < 0) {
      return;
    }

    const selGallery = settings.value.favoriteImagesMode
    ? (currentImage.value as FavImageInfo).gallery
    : settings.value.selectedGallery;

    const img_info = await api.renameImage(selGallery, currentImage.value.name, newName)

   const filterShowMode = img_info.marked
      ? GalleryShowMode.Unmarked
      : GalleryShowMode.Marked;

    if (
      settings.value.showMode == filterShowMode &&
      !settings.value.favoriteImagesMode
    ) {
      images.value.splice(currentImageIndex.value, 1);
      if (randomMode.value) {
        randomImage();
      } else {
        // move to next if possible
        if (currentImageIndex.value === images.value.length) {
          prevImage();
        }
      }
    } else {
      images.value[currentImageIndex.value] = {
        ...images.value[currentImageIndex.value],
        ...img_info,
      };
    } 
  }
  // TODO throw an error
  async function deleteCurrentImage() {
    if (currentImageIndex.value < 0) {
      return;
    }

    // FIXME check response
    if (settingsStore.settings.favoriteImagesMode) {
      const img = currentImage.value as FavImageInfo;
      await api.deleteImageFromFav(img.gallery, img.name);
    } else {
      await api.deleteImage(
        settingsStore.settings!.selectedGallery,
        currentImage.value.name
      );
    }

    images.value.splice(currentImageIndex.value, 1);
  }

  // fav
  async function addCurrentImageToFav() {
    if (
      settingsStore.settings &&
      settingsStore.settings.selectedGallery &&
      currentImage.value
    ) {
      await api.addImageToFav(
        settingsStore.settings.selectedGallery,
        currentImage.value.name
      );
      currentImage.value.is_fav = true;
    }
  }

  async function deleteCurrentImageFromFav() {
    if (
      settingsStore.settings &&
      settingsStore.settings.selectedGallery &&
      currentImage.value
    ) {
      await api.deleteImageFromFav(
        settingsStore.settings.selectedGallery,
        currentImage.value.name
      );
      currentImage.value.is_fav = false;
    }
  }

  return {
    images,
    currentImageIndex,
    imagesLoaded,
    imagesFilter,
    currentImage,
    currentGallery,
    randomMode,
    resetImages,
    fetchImages,
    goToIndex,
    firstImage,
    lastImage,
    nextImage,
    prevImage,
    randomImage,
    shuffleImages: shuffleImages2,
    markCurrentImage,
    unmarkCurrentImage,
    renameCurrentImage,
    deleteCurrentImage,
    addCurrentImageToFav,
    deleteCurrentImageFromFav,
  };
});
