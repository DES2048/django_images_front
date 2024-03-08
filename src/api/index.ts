import type {GalleryShowMode, ImageInfo, PickerSettings, Gallery, FavImageInfo} from '../models'
import Cookie from 'js-cookie'
import { ClientError, NetworkError, ServerError, ValidationError } from './errors'
const CSRF_COOKIE_NAME = 'csrftoken'
const CSRF_HEADER_NAME = 'X-CSRFToken'
const API_BASE_URL = new URL(import.meta.env.API_BASE_URL ? 
  import.meta.env.API_BASE_URL: document.location.origin)

// TODO helper from SettingsResponse to PickerSettings
// response types
export interface SettingsResponse {
  selected_gallery:string, 
  show_mode: GalleryShowMode
  fav_images_mode: boolean
  shuffle_pics_when_loaded: boolean
}

// utility function
export function fakeDeleteMode(): boolean {
  const p = new URLSearchParams(window.location.search)
  return p.has("fake-del")
}
class API {
  // TODO Separate class?
  endpoints = {
    settings: new URL("/settings/", API_BASE_URL),
    galleries: new URL("/galleries/", API_BASE_URL),
    pinUnpinGallery(gallery:string, pin:boolean) {
      return new URL(`/galleries/${gallery}/${pin ? 'pin': 'unpin'}`, API_BASE_URL);
    },
    images(gallery:string, show_mode:GalleryShowMode) {
      return new URL(`/galleries/${gallery}/images/?show_mode=${show_mode}`, API_BASE_URL);
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
    favImage() {
      return new URL(`/fav-images/`, API_BASE_URL)
    }   
  }

  // TODO Pass endpoints to constuctor
  constructor() {
  }
  private getCSRFfromCookie() {
    return Cookie.get(CSRF_COOKIE_NAME)!;
  }
  private setCSRFToken() {
    return {
      [CSRF_HEADER_NAME] : this.getCSRFfromCookie()
    }
  }
  public async doMethod<R>(method:string, url:URL, body?:any): Promise<R> {
    let resp: Response;
    try {
      resp =  await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.setCSRFToken()
        },
        body: body ? JSON.stringify(body): undefined
      });
      
    } catch (err){
        throw new NetworkError((err as Error).message)
    }
    
    const statusCode = resp.status
    
    if(statusCode >= 400 && statusCode <= 499) {
      if (statusCode === 400) {
        // create validation error
        const errors = await resp.json() as {[index:string]:string[]}
        const {"common-errors":commonErrors, ...fieldErrors} = errors;
        throw new ValidationError(fieldErrors, commonErrors)
      }
      throw new ClientError(statusCode, "client error")
    } else if(statusCode >= 500 && statusCode <=599) {
      throw new ServerError(statusCode, "server error")
    }
    if (+resp.headers.get("Content-Length")! > 0)
      return await resp.json() as R
    else
      return Promise.resolve() as R
  }  
  public async doPost<R>(url:URL, body?:any): Promise<R> {
    return await this.doMethod<R>("POST", url, body)
  }
  async getGalleries () : Promise<Gallery[]> {
    const resp = await fetch(this.endpoints.galleries);
    return await resp.json() as Gallery[];
  }
  async pinUnpinGallery(gallery: string, pin: boolean): Promise<Gallery> {
    const url = this.endpoints.pinUnpinGallery(gallery, pin)
    return await this.doPost<Gallery>(url)
  }
  async getSettings () : Promise<PickerSettings> {
    const resp = await fetch(this.endpoints.settings);
    const data = await resp.json() as SettingsResponse;
    return {
      selectedGallery:data.selected_gallery,
      showMode:data.show_mode,
      favoriteImagesMode: data.fav_images_mode,
      shufflePicsWhenLoaded: data.shuffle_pics_when_loaded
    } as PickerSettings
  }
  
  async saveSettings (settings:PickerSettings): Promise<PickerSettings> {
    const data =  await this.doPost<SettingsResponse>(this.endpoints.settings, {
        selected_gallery: settings.selectedGallery,
        show_mode: settings.showMode,
        fav_images_mode: settings.favoriteImagesMode,
        shuffle_pics_when_loaded: settings.shufflePicsWhenLoaded
    })
  
    return { 
      selectedGallery:data.selected_gallery,
      showMode:data.show_mode,
      favoriteImagesMode: data.fav_images_mode,
      shufflePicsWhenLoaded: data.shuffle_pics_when_loaded
    };
  }
  /**
   * fetch images, filtered by show_mode
   */
  async getImages(gallery:string, show_mode:GalleryShowMode): Promise<ImageInfo[]> {
    const _url = this.endpoints.images(gallery, show_mode);
    const resp = await fetch(_url);
    return await resp.json() as ImageInfo[];
        
  }
  async markImage(gallery:string, imgName:string): Promise<ImageInfo> {
    const url = this.endpoints.markImage(gallery, imgName)
    return await this.doPost<ImageInfo>(url) 
  
  }
  async unmarkImage(gallery:string, imgName:string): Promise<ImageInfo> {
    const url = this.endpoints.unmarkImage(gallery, imgName)
    return await this.doPost<ImageInfo>(url) 
  }
  async renameImage(gallery:string, oldName:string, newName:string): Promise<ImageInfo> {
    const url = this.endpoints.renameImage(gallery)
    return await this.doPost(url, {
      old_name: oldName,
      new_name: newName
    })
  }
  async copyMoveImage(srcGallery:string, dstGallery: string, imageName:string, move: boolean) {
    const url = this.endpoints.copyMoveImage(srcGallery)
    return await this.doPost<void>(url, {
      dst_gallery: dstGallery,
      image_name: imageName,
      move
    })
  }
  async deleteImage(gallery:string, url:string) {
    if(fakeDeleteMode()) return;
    return await this.doPost<void>(this.endpoints.deleteImage(gallery, url))
  }
  // favs
  async addImageToFav(gallery:string, imgName:string): Promise<ImageInfo> {
    const url = this.endpoints.favImage()
    return await this.doMethod("POST", url, {
      gallery, name: imgName
    })
  }
  async getFavImages(): Promise<FavImageInfo[]> {
    const url = this.endpoints.favImage()
    const resp = await fetch(url);
    return await resp.json() as FavImageInfo[];
  }
  async deleteImageFromFav(gallery:string, imgName:string): Promise<void> {
    const url = this.endpoints.favImage()
    return await this.doMethod<void>("DELETE", url, {
      gallery, name: imgName
    })
  }
}

export default new API()