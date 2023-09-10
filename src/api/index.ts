import type {GalleryShowMode, ImageInfo, PickerSettings, Gallery} from '../models'
import Cookie from 'js-cookie'

const CSRF_COOKIE_NAME = 'csrftoken'
const CSRF_HEADER_NAME = 'X-CSRFToken'
const API_BASE_URL = new URL(import.meta.env.API_BASE_URL ? 
  import.meta.env.API_BASE_URL: document.location.origin)

// TODO helper from SettingsResponse to PickerSettings
export interface ImageInfoResponse {
  name:string, 
  url:string, 
  marked:boolean, 
  mod_date:number
}

export interface SettingsResponse {
  selected_gallery:string, 
  show_mode: GalleryShowMode
}

class API {
  // TODO Separate class?
  endpoints = {
    settings: new URL("/settings/", API_BASE_URL),
    galleries: new URL("/galleries/", API_BASE_URL),
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
  async getGalleries () {
    const resp = await fetch(this.endpoints.galleries);
    return await resp.json() as Gallery[];
  }
  async getSettings () {
    const resp = await fetch(this.endpoints.settings);
    const data = await resp.json() as SettingsResponse;
    return {selectedGallery:data.selected_gallery, showMode:data.show_mode} as PickerSettings;
  }
  
  async saveSettings (settings:PickerSettings) {
    const resp =  await fetch(this.endpoints.settings, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.setCSRFToken()
      },
      body: JSON.stringify({
        selected_gallery: settings.selectedGallery,
        show_mode: settings.showMode
      })
    });

    const data = await resp.json() as SettingsResponse;
    return {selectedGallery:data.selected_gallery, showMode:data.show_mode} as PickerSettings;;
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
    const resp = await fetch(this.endpoints.markImage(gallery, imgName), 
      {
        method: "POST",
        headers: {
          ...this.setCSRFToken()
        }
      }
    );
    return await resp.json() as ImageInfo;
  }
  async unmarkImage(gallery:string, imgName:string): Promise<ImageInfo> {
    const resp = await fetch(this.endpoints.unmarkImage(gallery, imgName), 
      {
        method: "POST",
        headers: {
          ...this.setCSRFToken()
        }
      }
    );
    return await resp.json() as ImageInfo;
  }

  async deleteImage(gallery:string, url:string) {
    return await fetch(this.endpoints.deleteImage(gallery, url),
      {
        method: "POST",
        headers: {
          ...this.setCSRFToken()
        }
      });
  }
}

export default new API()