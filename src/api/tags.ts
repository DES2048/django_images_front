import type { Tag } from "@/models"
import endpoints, { type APIEndpoints } from "./endpoints"
export class TagsApi {
    endpoints: APIEndpoints
    constructor(endpoints:APIEndpoints) {
        this.endpoints = endpoints
    }

    async list():Promise<Tag[]> {
        const resp = await fetch(this.endpoints.tags())
        return await resp.json() as Tag[]
    }
}

export default new TagsApi(endpoints)