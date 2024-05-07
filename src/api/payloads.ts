import type { GalleryShowMode } from "@/models"

export interface AddGalleryPayload {
    title: string
    slug: string
    dir_path: string
    pinned: boolean
}

export interface ImagesFilter {
    tags?: number[]
    showMode?: GalleryShowMode
}

export type UpdateGalleryPayload = Partial<Omit<AddGalleryPayload, "slug">>

export interface AddTagPayload {
    name:string
}