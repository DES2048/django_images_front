import { defineStore } from "pinia";
import { readonly, ref } from "vue";

export const useUiStore = defineStore("sidenav", ()=> {
    const openSidenav = ref(false)
    const openSettings = ref(false)
    const openRenameImage = ref(false)
    const openCopyMoveToGallery = ref(false)
    const openGoToImage = ref(false)
    const openAddEditGallery = ref(false)
    const _openAddEditTag = ref(false)
    const addMode = ref(true)
    const editGalleryId = ref("")
    const openImageTags = ref(false)
    const _panelsVisible = ref(true)
    const panelsVisible = readonly(_panelsVisible)
    const _openGalleryFilter =ref(false)
    const openGalleryFilter = readonly(_openGalleryFilter)
    const moveToGalleryMode = ref(false)

    function openAddEditTag(open:boolean, isAddMode:boolean=true){
        addMode.value = isAddMode
        _openAddEditTag.value = open
    }
    function togglePanels() {
        _panelsVisible.value = !panelsVisible.value
    }

    function showGalleryFilter(galleryId:string) {
        editGalleryId.value = galleryId 
        _openGalleryFilter.value = true
    }
    function closeGalleryFilter() {
        editGalleryId.value = "" 
        _openGalleryFilter.value = false
    }
    return {
        openSidenav, openSettings, openRenameImage, openCopyMoveToGallery, moveToGalleryMode, openGoToImage,
        openAddEditGallery, addMode, editGalleryId, openImageTags, openAddEditTag, _openAddEditTag,
        togglePanels, panelsVisible, openGalleryFilter, showGalleryFilter, closeGalleryFilter
    }
})