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
  public async doPost<R>(url:URL, body?:any): Promise<R> {
    const resp =  await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.setCSRFToken()
      },
      body: body ? JSON.stringify(body): undefined
    });
    if (+resp.headers.get("Content-Length")! > 0)
      return await resp.json() as R
    else
      return Promise.resolve() as R
  }
  async getGalleries () {
    const resp = await fetch(this.endpoints.galleries);
    return await resp.json() as Gallery[];
  }
  async pinUnpinGallery(gallery: string, pin: boolean): Promise<Gallery> {
    const url = this.endpoints.pinUnpinGallery(gallery, pin)
    return await this.doPost<Gallery>(url)
  }
  async getSettings () {
    const resp = await fetch(this.endpoints.settings);
    const data = await resp.json() as SettingsResponse;
    return {selectedGallery:data.selected_gallery, showMode:data.show_mode} as PickerSettings;
  }
  
  async saveSettings (settings:PickerSettings) {
    const data =  await this.doPost<SettingsResponse>(this.endpoints.settings, {
        selected_gallery: settings.selectedGallery,
        show_mode: settings.showMode
    })
  
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
    const url = this.endpoints.markImage(gallery, imgName)
    return await this.doPost<ImageInfo>(url) 
  
  }
  async unmarkImage(gallery:string, imgName:string): Promise<ImageInfo> {
    const url = this.endpoints.unmarkImage(gallery, imgName)
    return await this.doPost<ImageInfo>(url) 
  }

  async deleteImage(gallery:string, url:string) {
    if(fakeDeleteMode()) return;
    return await this.doPost<void>(this.endpoints.deleteImage(gallery, url))
  }
}

export default new API()