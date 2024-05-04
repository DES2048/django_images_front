import { GalleryShowMode, type Tag, type TagWithCount } from "@/models"
import endpoints, { type APIEndpoints } from "./endpoints"
import type { AddTagPayload } from "./payloads"
import HttpHelper from "./helper"
export class TagsApi {
    endpoints: APIEndpoints
    constructor(endpoints:APIEndpoints) {
        this.endpoints = endpoints
    }

    async list(count_for_gallery:string="", count_for_show_mode:GalleryShowMode=GalleryShowMode.All)
        :Promise<Tag[]|TagWithCount[]> {
        const endpoint = this.endpoints.tags()
        if (count_for_gallery.length >0) {
            endpoint.searchParams.set("count-for-gallery", count_for_gallery)
            endpoint.searchParams.set("count-for-show-mode", count_for_show_mode)
        }
        
        const resp = await fetch(endpoint)
        return await resp.json() as Tag[]
    }
    async add(payload:AddTagPayload):Promise<Tag> {
        return await HttpHelper.doPost<Tag>(this.endpoints.tags(), payload)
    }
}

export default new TagsApi(endpoints)