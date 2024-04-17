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

    function openAddEditTag(open:boolean, isAddMode:boolean=true){
        addMode.value = isAddMode
        _openAddEditTag.value = open
    }
    function togglePanels() {
        _panelsVisible.value = !panelsVisible.value
    }
    return {
        openSidenav, openSettings, openRenameImage, openCopyMoveToGallery, openGoToImage,
        openAddEditGallery, addMode, editGalleryId, openImageTags, openAddEditTag, _openAddEditTag,
        togglePanels, panelsVisible
    }
})