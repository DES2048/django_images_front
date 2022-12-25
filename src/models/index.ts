import type { ImageInfoResponse, SettingsResponse } from "@/api";

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

export class PickerSettings {
    showMode:GalleryShowMode
    selectedGallery:string

    constructor(selected_gallery:string, show_mode:GalleryShowMode) {
        this.selectedGallery = selected_gallery;
        this.showMode = show_mode;
    }
    isEqual(settings:PickerSettings):boolean {
        return this.selectedGallery == settings.selectedGallery &&
            this.showMode == settings.showMode
    }
}