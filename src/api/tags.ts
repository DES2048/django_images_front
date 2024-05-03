import type { Tag, TagWithCount } from "@/models"
import endpoints, { type APIEndpoints } from "./endpoints"
import type { AddTagPayload } from "./payloads"
import HttpHelper from "./helper"
export class TagsApi {
    endpoints: APIEndpoints
    constructor(endpoints:APIEndpoints) {
        this.endpoints = endpoints
    }

    async list(count_for:string=""):Promise<Tag[]|TagWithCount[]> {
        const endpoint = this.endpoints.tags()
        if (count_for.length >0) {
            endpoint.searchParams.set("count-for", count_for)
        }
        
        const resp = await fetch(endpoint)
        return await resp.json() as Tag[]
    }
    async add(payload:AddTagPayload):Promise<Tag> {
        return await HttpHelper.doPost<Tag>(this.endpoints.tags(), payload)
    }
}

export default new TagsApi(endpoints)