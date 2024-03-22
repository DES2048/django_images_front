import type { Tag } from "@/models"
import endpoints, { type APIEndpoints } from "./endpoints"
import type { AddTagPayload } from "./payloads"
import HttpHelper from "./helper"
export class TagsApi {
    endpoints: APIEndpoints
    constructor(endpoints:APIEndpoints) {
        this.endpoints = endpoints
    }

    async list():Promise<Tag[]> {
        const resp = await fetch(this.endpoints.tags())
        return await resp.json() as Tag[]
    }
    async add(payload:AddTagPayload):Promise<Tag> {
        return await HttpHelper.doPost<Tag>(this.endpoints.tags(), payload)
    }
}

export default new TagsApi(endpoints)