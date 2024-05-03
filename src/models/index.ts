import {GalleryShowMode, type PickerSettings, isPickerSettingsEqual, type GallerySettings,
  type GalleriesLocalSettings} from './settings'

export interface Gallery {
  slug: string;
  title: string;
  pinned: boolean;
  pinned_date?: number;
  dir_path:string
}

export interface ImageInfo {
  name: string;
  url: string;
  marked: boolean;
  mod_time: number;
  is_fav: boolean;
}

export interface FavImageInfo extends ImageInfo {
  gallery: string;
  add_to_fav_date: number;
}

export interface Tag {
  id: number
  name: string
}

export interface TagWithCount extends Tag {
  images_count:number
}

export {
  GalleryShowMode, GallerySettings, GalleriesLocalSettings, PickerSettings, isPickerSettingsEqual
}
