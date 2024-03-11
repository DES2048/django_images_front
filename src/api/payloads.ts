export interface AddGalleryPayload {
    title: string
    slug: string
    dir_path: string
    pinned: boolean
}

export type UpdateGalleryPayload = Partial<Omit<AddGalleryPayload, "slug">>