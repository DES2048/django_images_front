import { tagsApi } from "@/api"
import { GalleryShowMode, type TagWithCount } from "@/models"
import { getGalleriesSettings, saveGallerySettings } from "@/storage"
import { useImagesStore } from "@/stores/images"
import { useSettingsStore } from "@/stores/settings"
import { useUiStore } from "@/stores/ui"
import { ref } from "vue"

export default function useImagesFilter() {
    // stores
    const uiStore = useUiStore()
    const imagesStore = useImagesStore()
    const settingsStore = useSettingsStore()

    // data
    const tags = ref<TagWithCount[]>([])
    const selectedTags = ref<number[]>([])

    async function fetchData() {
        // get gallery show_mode for tags image count stat
        const show_mode = settingsStore.settings.selectedGallery == uiStore.editGalleryId ?
            settingsStore.settings.showMode : GalleryShowMode.All

        let tagsData = await tagsApi.list(uiStore.editGalleryId, show_mode) as TagWithCount[]
        
        // get selected tags id from settings
        const galleriesSettings = getGalleriesSettings()
        const selTags = galleriesSettings[uiStore.editGalleryId]?.filter?.tags

        tagsData = tagsData.filter((t:TagWithCount)=>t.images_count >0 || (selTags && selTags.includes(t.id)))
        
        if (selTags) {

            // fill selected tags
            for(let tagId of selTags){
                const idx = tagsData.findIndex((t)=>t.id ===tagId)
                if(idx>=0) {
                    selectedTags.value.push(idx)
                }
            }
        }

        tags.value = tagsData
    }

    function resetSelectedTags() {
        selectedTags.value = []
    }

    async function handleSave() {
        const tagsToUpdate = selectedTags.value.map((t) => tags.value[t].id)
        saveGallerySettings(uiStore.editGalleryId, {
            filter: {
                tags: tagsToUpdate
            }
        })
        imagesStore.imagesFilter.selectedTags = tagsToUpdate
        //await imagesStore.fetchImages()
        uiStore.closeGalleryFilter()
    }

    return {
        tags,
        selectedTags,
        fetchData,
        resetSelectedTags,
        handleSave
    }
}