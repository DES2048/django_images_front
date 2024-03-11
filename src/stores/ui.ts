import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("sidenav", ()=> {
    const openSidenav = ref(false)
    const openSettings = ref(false)
    const openRenameImage = ref(false)
    const openCopyMoveToGallery = ref(false)
    const openGoToImage = ref(false)
    const openAddEditGallery = ref(false)
    const addMode = ref(true)
    const editGalleryId = ref("")

    return {
        openSidenav, openSettings, openRenameImage, openCopyMoveToGallery, openGoToImage,
        openAddEditGallery, addMode, editGalleryId
    }
})