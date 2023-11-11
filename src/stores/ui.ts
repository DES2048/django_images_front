import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("sidenav", ()=> {
    const openSidenav = ref(false)
    return {
        openSidenav
    }
})