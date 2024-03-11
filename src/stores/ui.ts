import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("sidenav", ()=> {
    const openSidenav = ref(false)
    const openSettings = ref(false)
    const openRenameImage = ref(false)
    return {
        openSidenav, openSettings, openRenameImage
    }
})