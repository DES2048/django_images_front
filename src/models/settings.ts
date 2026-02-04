export const GALLERY_SETTINGS_LOCAL_VER=1

export enum GalleryShowMode {
    All = "all",
    Marked = "marked",
    Unmarked = "unmarked",
}

export interface PickerSettings {
    showMode: GalleryShowMode;
    selectedGallery: string;
    selectedTags: number[];
    favoriteImagesMode: boolean;
    shufflePicsWhenLoaded: boolean;
  }
  
  export interface GalleryFilter {
    tags: number[]
  }

  // settings for certain gallery, now saved in local storage
  export interface GallerySettings {
    lastShowMode: GalleryShowMode
    shufflePicsWhenLoaded: boolean,
    filter?: GalleryFilter,
    sorting?: string
  }
  
  // settings for every gallery(as key) for saving in local storage
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
