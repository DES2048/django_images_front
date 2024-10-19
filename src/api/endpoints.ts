import type { GalleryShowMode } from "@/models";
import type { ImagesFilter } from "./payloads";

const API_BASE_URL = new URL(import.meta.env.API_BASE_URL ?
    import.meta.env.API_BASE_URL: document.location.origin)

export interface APIEndpoints {
    settings(): URL
    galleries(): URL
    gallery(gallery:string): URL
    pinUnpinGallery(gallery:string, pin:boolean): URL
    images(gallery:string, show_mode:GalleryShowMode, filter:ImagesFilter): URL
    filterImages(filter:ImagesFilter): URL
    imageTags(gallery:string, imgName:string): URL
    deleteImage(gallery:string, imgName:string): URL
    markImage(gallery:string, imgName:string): URL
    unmarkImage(gallery:string, imgName:string): URL
    renameImage(gallery:string): URL
    copyMoveImage(srcGallery:string): URL
    favImage(imagesFilter?:ImagesFilter): URL
    tags(): URL
}

const endpoints:APIEndpoints = {
    settings: ()=> new URL("/settings/", API_BASE_URL),
    galleries: ()=> new URL("/galleries/", API_BASE_URL),
    gallery: (gallery:string)=> new URL(`/galleries/${gallery}`, API_BASE_URL),
    pinUnpinGallery(gallery:string, pin:boolean) {
      return new URL(`/galleries/${gallery}/${pin ? 'pin': 'unpin'}`, API_BASE_URL);
    },
    images(gallery:string, show_mode:GalleryShowMode, filter:ImagesFilter) {
     
      const url = new URL(`/galleries/${gallery}/images/?show_mode=${show_mode}`, API_BASE_URL);
      if (filter.tags) {
        for (let tagId of filter.tags) {
          url.searchParams.append("tags", tagId.toString())
        }
       
      }
      return url
    },
    filterImages(filter:ImagesFilter) {
        return new URL(`/filter-images/`, API_BASE_URL)
    },
    deleteImage(gallery:string, imgName:string) {
      return new URL(`/delete-image/${gallery}/${imgName}`, API_BASE_URL);  
    },
    markImage(gallery:string, imgName:string) {
      return new URL(`/galleries/${gallery}/images/${imgName}/mark`, API_BASE_URL);
    },
    unmarkImage(gallery:string, imgName:string) {
      return new URL(`/galleries/${gallery}/images/${imgName}/unmark`, API_BASE_URL);
    },
    renameImage(gallery:string) {
      return new URL(`/galleries/${gallery}/images/rename`, API_BASE_URL);
    },
    copyMoveImage(srcGallery:string) {
      return new URL(`galleries/${srcGallery}/images/copy-move`, API_BASE_URL)
    },
    imageTags(gallery:string, imgName:string) {
      return new URL(`/galleries/${gallery}/images/${imgName}/tags`, API_BASE_URL);
    },
    favImage(imagesFilter?:ImagesFilter) {
      const url = new URL(`/fav-images/`, API_BASE_URL)
      const showMode = imagesFilter?.showMode
      if (showMode) {
        url.searchParams.append("show_mode", showMode)
      }
      
      return url
    },
    tags() {
        return new URL(`/tags/`, API_BASE_URL)
    }, 
  }

  export default endpoints