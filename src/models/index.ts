
export enum GalleryShowMode {
    All = "all",
    Marked = "marked",
    Unmarked = "unmarked"
}

export interface Gallery {
    slug: string
    title: string
}

export interface ImageInfo {
    name: string
    url: string
    marked: boolean
    mod_date: number
}

export interface PickerSettings {
    showMode:GalleryShowMode
    selectedGallery:string
}

export function isPickerSettingsEqual(s1:PickerSettings, s2?:PickerSettings):boolean {
    if (!s2) {
        return false
    }
    return s1.selectedGallery == s2.selectedGallery &&
        s1.showMode == s2.showMode
}