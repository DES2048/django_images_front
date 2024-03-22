export enum GalleryShowMode {
  All = "all",
  Marked = "marked",
  Unmarked = "unmarked",
}

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
export interface PickerSettings {
  showMode: GalleryShowMode;
  selectedGallery: string;
  selectedTags: number[];
  favoriteImagesMode: boolean;
  shufflePicsWhenLoaded: boolean;
}

export interface GallerySettings {
  lastShowMode: GalleryShowMode
  shufflePicsWhenLoaded: boolean
}

export interface GalleriesLocalSettings {
  [index:string]: GallerySettings
}

export function isPickerSettingsEqual(
  s1: PickerSettings,
  s2?: PickerSettings
): boolean {
  if (!s2) {
    return false;
  }
  return (
    s1.selectedGallery == s2.selectedGallery &&
    s1.showMode == s2.showMode &&
    s1.favoriteImagesMode == s2.favoriteImagesMode &&
    s1.shufflePicsWhenLoaded == s2.shufflePicsWhenLoaded &&
    JSON.stringify(s1.selectedTags?.sort()) == JSON.stringify(s2.selectedTags?.sort()) // HACK for array
    // comparsion
  );
}
